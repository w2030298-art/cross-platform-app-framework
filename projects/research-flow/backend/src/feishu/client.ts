import axios from 'axios';

const FEISHU_BASE = 'https://open.feishu.cn/open-apis';

let _tenantAccessToken: string | null = null;
let _tokenExpiresAt = 0;

async function getTenantAccessToken(): Promise<string> {
  if (_tenantAccessToken && Date.now() < _tokenExpiresAt) {
    return _tenantAccessToken;
  }

  const appId = process.env.FEISHU_APP_ID!;
  const appSecret = process.env.FEISHU_APP_SECRET!;

  const res = await axios.post(`${FEISHU_BASE}/auth/v3/tenant_access_token/internal`, {
    app_id: appId,
    app_secret: appSecret,
  });

  if (res.data.code !== 0) {
    throw new Error(`Feishu auth error: ${res.data.msg}`);
  }

  _tenantAccessToken = res.data.tenant_access_token;
  _tokenExpiresAt = Date.now() + (res.data.expire - 300) * 1000;
  return _tenantAccessToken!;
}

export async function getUserAccessToken(code: string) {
  const appId = process.env.FEISHU_APP_ID!;
  const appSecret = process.env.FEISHU_APP_SECRET!;

  const res = await axios.post(`${FEISHU_BASE}/authen/v1/oidc/access_token`, {
    grant_type: 'authorization_code',
    code,
  }, {
    headers: {
      'Content-Type': 'application/json',
      'app_id': appId,
      'app_secret': appSecret,
    },
  });

  if (res.data.code !== 0) {
    throw new Error(`Feishu get access token error: ${res.data.msg}`);
  }

  return res.data.data;
}

export async function getUserInfo(userAccessToken: string) {
  const res = await axios.get(`${FEISHU_BASE}/authen/v1/user_info`, {
    headers: {
      'Authorization': `Bearer ${userAccessToken}`,
    },
  });

  if (res.data.code !== 0) {
    throw new Error(`Feishu get user info error: ${res.data.msg}`);
  }

  return res.data.data;
}

export async function refreshUserAccessToken(refreshToken: string) {
  const appId = process.env.FEISHU_APP_ID!;
  const appSecret = process.env.FEISHU_APP_SECRET!;

  const res = await axios.post(`${FEISHU_BASE}/authen/v1/oidc/refresh_access_token`, {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  }, {
    headers: {
      'Content-Type': 'application/json',
      'app_id': appId,
      'app_secret': appSecret,
    },
  });

  if (res.data.code !== 0) {
    throw new Error(`Feishu refresh token error: ${res.data.msg}`);
  }

  return res.data.data;
}

export async function sendBotMessage(receiveId: string, receiveIdType: 'open_id' | 'user_id' | 'email', msgType: string, content: string) {
  const token = await getTenantAccessToken();

  const res = await axios.post(`${FEISHU_BASE}/im/v1/messages`, {
    receive_id: receiveId,
    msg_type: msgType,
    content,
  }, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    params: {
      receive_id_type: receiveIdType,
    },
  });

  return res.data.data;
}

export async function sendTextMessage(receiveId: string, text: string, receiveIdType: 'open_id' | 'user_id' | 'email' = 'open_id') {
  const content = JSON.stringify({ text });
  return sendBotMessage(receiveId, receiveIdType, 'text', content);
}

export async function getUserIdByEmail(email: string) {
  const token = await getTenantAccessToken();
  const res = await axios.get(`${FEISHU_BASE}/contact/v3/users/batch_get_id`, {
    headers: { 'Authorization': `Bearer ${token}` },
    params: { emails: email },
  });

  if (res.data.code !== 0) return null;
  const userList = res.data.data?.user_list;
  if (!userList?.length) return null;
  return userList[0].user_id;
}

export async function getFeishuDocContent(docToken: string) {
  const token = await getTenantAccessToken();
  const res = await axios.get(`${FEISHU_BASE}/docx/v1/documents/${docToken}/blocks`, {
    headers: { 'Authorization': `Bearer ${token}` },
    params: { page_size: 500 },
  });

  if (res.data.code !== 0) {
    throw new Error(`Feishu get doc error: ${res.data.msg}`);
  }
  return res.data.data;
}

export async function createFeishuDoc(title: string, content: string, folderToken?: string) {
  const token = await getTenantAccessToken();

  const createRes = await axios.post(`${FEISHU_BASE}/docx/v1/documents`, {
    title,
  }, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (createRes.data.code !== 0) {
    throw new Error(`Feishu create doc error: ${createRes.data.msg}`);
  }

  return createRes.data.data;
}
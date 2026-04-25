import type { ContentItem } from '../types/content'

class ContentStore {
  list: ContentItem[] = []

  setList(list: ContentItem[]) {
    this.list = list
  }
}

export const contentStore = new ContentStore()

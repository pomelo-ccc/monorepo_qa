import { FaqItem } from '../models';
import { JsonRepository, DATA_FILES } from './base.repository';

/**
 * FAQ 数据访问层
 */
export class FaqRepository extends JsonRepository<FaqItem> {
  constructor() {
    super(DATA_FILES.faqs);
  }

  async findById(id: string): Promise<FaqItem | undefined> {
    const faqs = await this.findAll();
    return faqs.find((f) => f.id === id);
  }
}

export const faqRepository = new FaqRepository();

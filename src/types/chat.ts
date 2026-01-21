export interface ReportPrices {
     BASIC_REPORT: number;
     ADVANCED_REPORT: number;
     OPTIMIZED_GENERATION: number;
     AI_IMPROVEMENT: number;
     AI_COACH_INTERACTION: number;
 }

 export interface ChatMessage {
    _id: string; // or $id
    text: string;
    createdAt: Date;
    user: {
      _id: string;
      name: string;
      avatar?: string;
    };
 }

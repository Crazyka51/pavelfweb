// Typové deklarace pro Google Analytics
interface Window {
  gtag: (
    command: string,
    action: string,
    params: {
      event_category?: string;
      event_label?: string;
      value?: number;
      [key: string]: any;
    }
  ) => void;
}

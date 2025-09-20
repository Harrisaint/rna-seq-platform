declare module 'plotly.js-dist-min' {
  export interface PlotData {
    [key: string]: any;
  }
  
  export interface Layout {
    [key: string]: any;
  }
  
  export interface Config {
    [key: string]: any;
  }
  
  export interface PlotlyInstance {
    newPlot: (
      element: HTMLElement | string,
      data: PlotData[],
      layout?: Partial<Layout>,
      config?: Partial<Config>
    ) => Promise<void>;
    react: (
      element: HTMLElement | string,
      data: PlotData[],
      layout?: Partial<Layout>,
      config?: Partial<Config>
    ) => Promise<void>;
  }
  
  const Plot: PlotlyInstance;
  export default Plot;
}

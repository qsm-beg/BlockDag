export interface EnergyData {
  transformerLoad: number;
  currentUsage: number;
  solarGeneration: number;
  netUsage: number;
  incentiveRate: number;
  isPeakTime: boolean;
}

class DataSimulator {
  private listeners: ((data: EnergyData) => void)[] = [];
  private interval: NodeJS.Timeout | null = null;
  private currentData: EnergyData = {
    transformerLoad: 45,
    currentUsage: 3.2,
    solarGeneration: 1.5,
    netUsage: 1.7,
    incentiveRate: 2.5,
    isPeakTime: false,
  };

  private isPeakHours(): boolean {
    const now = new Date();
    const hour = now.getHours();
    return (hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 21);
  }

  private simulateData(): EnergyData {
    const isPeak = this.isPeakHours();
    const baseLoad = isPeak ? 70 : 40;
    const variation = Math.random() * 20 - 10;

    this.currentData.transformerLoad = Math.max(
      0,
      Math.min(100, baseLoad + variation + (Math.random() * 10))
    );

    this.currentData.currentUsage = 2.5 + Math.random() * 2;
    this.currentData.solarGeneration = Math.max(0, 1.0 + Math.random() * 1.5);
    this.currentData.netUsage = Math.max(
      0,
      this.currentData.currentUsage - this.currentData.solarGeneration
    );

    this.currentData.incentiveRate = this.currentData.transformerLoad > 70 ? 3.5 : 2.5;
    this.currentData.isPeakTime = isPeak;

    return { ...this.currentData };
  }

  subscribe(callback: (data: EnergyData) => void): () => void {
    this.listeners.push(callback);

    if (!this.interval) {
      this.start();
    }

    callback(this.currentData);

    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
      if (this.listeners.length === 0) {
        this.stop();
      }
    };
  }

  private start() {
    this.interval = setInterval(() => {
      const data = this.simulateData();
      this.listeners.forEach(listener => listener(data));
    }, 5000);
  }

  private stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

export default new DataSimulator();
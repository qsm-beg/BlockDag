export interface Prediction {
  id: string;
  timestamp: Date;
  timeRange: {
    start: Date;
    end: Date;
  };
  area: string;
  city: string;
  probability: number;
  status: 'upcoming' | 'active' | 'completed';
  outcome?: 'prevented' | 'occurred' | 'partial';
  participationRate?: number;
  actualLoad?: number;
}

export interface PredictionRecord extends Prediction {
  totalParticipants: number;
  energySaved: number;
  rewardsDistributed: number;
  accuracyScore: number;
}

export interface AccuracyData {
  weekly: number;
  monthly: number;
  overloadsPrevented: number;
}

class PredictionService {
  private upcomingListeners: ((predictions: Prediction[]) => void)[] = [];
  private historyListeners: ((history: PredictionRecord[]) => void)[] = [];
  private accuracyListeners: ((accuracy: AccuracyData) => void)[] = [];
  private alertListeners: ((prediction: Prediction | null) => void)[] = [];

  private upcomingPredictions: Prediction[] = [];
  private predictionHistory: PredictionRecord[] = [];
  private accuracyData: AccuracyData = {
    weekly: 92,
    monthly: 88,
    overloadsPrevented: 47,
  };

  private areas = [
    { area: 'Rondebosch', city: 'Cape Town' },
    { area: 'Sandton', city: 'Johannesburg' },
    { area: 'Sea Point', city: 'Cape Town' },
    { area: 'Claremont', city: 'Cape Town' },
    { area: 'Camps Bay', city: 'Cape Town' },
    { area: 'Greenpoint', city: 'Cape Town' },
    { area: 'Observatory', city: 'Cape Town' },
    { area: 'Newlands', city: 'Cape Town' },
  ];

  constructor() {
    this.initializeMockData();
    this.startSimulation();
  }

  private initializeMockData() {
    // Create upcoming predictions
    const now = new Date();

    // Prediction in 2 hours
    this.upcomingPredictions.push({
      id: '1',
      timestamp: new Date(),
      timeRange: {
        start: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        end: new Date(now.getTime() + 3 * 60 * 60 * 1000),
      },
      area: 'Rondebosch',
      city: 'Cape Town',
      probability: 85,
      status: 'upcoming',
      participationRate: 0,
    });

    // Prediction tomorrow morning
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(7, 30, 0, 0);

    this.upcomingPredictions.push({
      id: '2',
      timestamp: new Date(),
      timeRange: {
        start: tomorrow,
        end: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000),
      },
      area: 'Sea Point',
      city: 'Cape Town',
      probability: 72,
      status: 'upcoming',
      participationRate: 0,
    });

    // Create historical data
    for (let i = 0; i < 10; i++) {
      const daysAgo = i + 1;
      const historyDate = new Date(now);
      historyDate.setDate(historyDate.getDate() - daysAgo);
      historyDate.setHours(17 + (i % 3), 0, 0, 0);

      const outcome = Math.random() > 0.3 ? 'prevented' : Math.random() > 0.5 ? 'partial' : 'occurred';
      const area = this.areas[Math.floor(Math.random() * this.areas.length)];

      this.predictionHistory.push({
        id: `history-${i}`,
        timestamp: historyDate,
        timeRange: {
          start: historyDate,
          end: new Date(historyDate.getTime() + 60 * 60 * 1000),
        },
        area: area.area,
        city: area.city,
        probability: 70 + Math.floor(Math.random() * 25),
        status: 'completed',
        outcome,
        participationRate: 60 + Math.floor(Math.random() * 35),
        actualLoad: outcome === 'prevented' ? 75 : outcome === 'partial' ? 85 : 95,
        totalParticipants: 200 + Math.floor(Math.random() * 300),
        energySaved: outcome === 'prevented' ? 150 + Math.random() * 100 : outcome === 'partial' ? 50 + Math.random() * 50 : 0,
        rewardsDistributed: outcome === 'prevented' ? 2500 + Math.random() * 1500 : outcome === 'partial' ? 1000 + Math.random() * 500 : 0,
        accuracyScore: 85 + Math.floor(Math.random() * 10),
      });
    }

    // Sort history by date (newest first)
    this.predictionHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private startSimulation() {
    // Update predictions every minute
    setInterval(() => {
      const now = new Date();

      // Check if any upcoming predictions should become active
      this.upcomingPredictions.forEach(pred => {
        if (pred.status === 'upcoming' && pred.timeRange.start <= now && pred.timeRange.end > now) {
          pred.status = 'active';
          pred.participationRate = 20 + Math.floor(Math.random() * 30);
        } else if (pred.status === 'active' && pred.timeRange.end <= now) {
          // Move to history
          this.moveToHistory(pred);
        }
      });

      // Update participation rates for active predictions
      this.upcomingPredictions
        .filter(p => p.status === 'active')
        .forEach(p => {
          if (p.participationRate !== undefined && p.participationRate < 90) {
            p.participationRate = Math.min(90, p.participationRate + Math.random() * 5);
          }
        });

      // Occasionally add new predictions
      if (Math.random() > 0.95 && this.upcomingPredictions.length < 5) {
        this.addNewPrediction();
      }

      // Update accuracy metrics
      this.updateAccuracy();

      // Notify listeners
      this.notifyUpcomingListeners();
      this.notifyAlertListeners();
    }, 30000); // Every 30 seconds
  }

  private moveToHistory(prediction: Prediction) {
    const outcome = Math.random() > 0.4 ? 'prevented' : Math.random() > 0.5 ? 'partial' : 'occurred';
    const record: PredictionRecord = {
      ...prediction,
      status: 'completed',
      outcome,
      actualLoad: outcome === 'prevented' ? 75 : outcome === 'partial' ? 85 : 95,
      totalParticipants: 200 + Math.floor(Math.random() * 300),
      energySaved: outcome === 'prevented' ? 150 + Math.random() * 100 : outcome === 'partial' ? 50 + Math.random() * 50 : 0,
      rewardsDistributed: outcome === 'prevented' ? 2500 + Math.random() * 1500 : outcome === 'partial' ? 1000 + Math.random() * 500 : 0,
      accuracyScore: 85 + Math.floor(Math.random() * 10),
    };

    this.predictionHistory.unshift(record);
    this.upcomingPredictions = this.upcomingPredictions.filter(p => p.id !== prediction.id);
    this.notifyHistoryListeners();
  }

  private addNewPrediction() {
    const now = new Date();
    const hoursAhead = 3 + Math.floor(Math.random() * 45); // 3-48 hours ahead
    const startTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
    const area = this.areas[Math.floor(Math.random() * this.areas.length)];

    this.upcomingPredictions.push({
      id: `pred-${Date.now()}`,
      timestamp: now,
      timeRange: {
        start: startTime,
        end: new Date(startTime.getTime() + (1 + Math.random()) * 60 * 60 * 1000),
      },
      area: area.area,
      city: area.city,
      probability: 65 + Math.floor(Math.random() * 30),
      status: 'upcoming',
      participationRate: 0,
    });

    // Sort by start time
    this.upcomingPredictions.sort((a, b) => a.timeRange.start.getTime() - b.timeRange.start.getTime());
  }

  private updateAccuracy() {
    // Simulate gradual improvement
    if (Math.random() > 0.7) {
      this.accuracyData.weekly = Math.min(100, this.accuracyData.weekly + Math.random() * 2);
      this.accuracyData.monthly = Math.min(100, this.accuracyData.monthly + Math.random() * 1.5);
    }

    // Occasionally increment prevented overloads
    if (Math.random() > 0.95) {
      this.accuracyData.overloadsPrevented++;
    }

    this.notifyAccuracyListeners();
  }

  subscribeToUpcoming(callback: (predictions: Prediction[]) => void): () => void {
    this.upcomingListeners.push(callback);
    callback(this.upcomingPredictions);
    return () => {
      this.upcomingListeners = this.upcomingListeners.filter(l => l !== callback);
    };
  }

  subscribeToHistory(callback: (history: PredictionRecord[]) => void): () => void {
    this.historyListeners.push(callback);
    callback(this.predictionHistory);
    return () => {
      this.historyListeners = this.historyListeners.filter(l => l !== callback);
    };
  }

  subscribeToAccuracy(callback: (accuracy: AccuracyData) => void): () => void {
    this.accuracyListeners.push(callback);
    callback(this.accuracyData);
    return () => {
      this.accuracyListeners = this.accuracyListeners.filter(l => l !== callback);
    };
  }

  subscribeToAlerts(callback: (prediction: Prediction | null) => void): () => void {
    this.alertListeners.push(callback);
    const nextPrediction = this.getNextPrediction();
    callback(nextPrediction);
    return () => {
      this.alertListeners = this.alertListeners.filter(l => l !== callback);
    };
  }

  private getNextPrediction(): Prediction | null {
    const now = new Date();
    const twoHours = 2 * 60 * 60 * 1000;

    // Find predictions within next 2 hours or currently active
    const urgent = this.upcomingPredictions.find(p =>
      p.status === 'active' ||
      (p.timeRange.start.getTime() - now.getTime() <= twoHours)
    );

    return urgent || null;
  }

  private notifyUpcomingListeners() {
    this.upcomingListeners.forEach(listener => listener(this.upcomingPredictions));
  }

  private notifyHistoryListeners() {
    this.historyListeners.forEach(listener => listener(this.predictionHistory));
  }

  private notifyAccuracyListeners() {
    this.accuracyListeners.forEach(listener => listener(this.accuracyData));
  }

  private notifyAlertListeners() {
    const nextPrediction = this.getNextPrediction();
    this.alertListeners.forEach(listener => listener(nextPrediction));
  }
}

export const predictionService = new PredictionService();
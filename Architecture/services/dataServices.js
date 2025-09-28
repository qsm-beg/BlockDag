// services/mockDataService.js
const { ethers } = require('ethers');

/**
 * Mock Data Service for GridSmart Energy MVP
 * Generates realistic South African transformer load patterns for demo
 */
class MockDataService {
    constructor() {
        this.currentLoad = 50;
        this.temperature = 25;
        this.isRunning = false;
        this.intervalId = null;
    }
    
    /**
     * Generate realistic transformer load data based on SA patterns
     */
    generateTransformerData() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const day = now.getDay(); // 0 = Sunday
        
        // South African load patterns (based on Eskom data patterns)
        const loadCurve = {
            // Night hours (low demand)
            0: 42, 1: 38, 2: 35, 3: 33, 4: 35, 5: 40,
            // Morning peak (high demand - people waking up)
            6: 65, 7: 75, 8: 80, 9: 70, 10: 65, 11: 60,
            // Midday (moderate demand)
            12: 62, 13: 65, 14: 68, 15: 70, 16: 72,
            // Evening peak (highest demand - people coming home)
            17: 78, 18: 85, 19: 88, 20: 82, 21: 75,
            // Late evening wind down
            22: 65, 23: 55
        };
        
        let baseLoad = loadCurve[hour] || 50;
        
        // Weekend adjustments (different patterns)
        if (day === 0 || day === 6) { // Weekend
            if (hour >= 8 && hour <= 11) baseLoad *= 0.9; // Less morning peak
            if (hour >= 17 && hour <= 20) baseLoad *= 0.85; // Less evening peak
        }
        
        // Add realistic variations
        const minuteVariation = Math.sin((minute / 60) * Math.PI * 2) * 3;
        const randomNoise = (Math.random() - 0.5) * 8;
        const trendVariation = Math.sin(Date.now() / 300000) * 5; // 5-minute trend
        
        this.currentLoad = Math.max(20, Math.min(95, 
            baseLoad + minuteVariation + randomNoise + trendVariation
        ));
        
        // Temperature affects load (AC/heating usage)
        this.temperature = this.generateTemperature(hour);
        if (this.temperature > 30) {
            this.currentLoad *= 1.1; // AC usage increases load
        } else if (this.temperature < 10) {
            this.currentLoad *= 1.05; // Heating increases load
        }
        
        return {
            transformerId: "TRF_001_CPT_WOODSTOCK",
            currentLoad: Math.round(this.currentLoad * 100) / 100,
            voltage: 11000 + (Math.random() - 0.5) * 500, // 11kV +/- variation
            current: Math.round(this.currentLoad * 2.5), // Simplified current calculation
            temperature: Math.round(this.temperature * 10) / 10,
            oilLevel: 95 + Math.random() * 5, // Oil level 95-100%
            timestamp: Date.now(),
            location: {
                name: "Woodstock Substation",
                lat: -33.9249,
                lng: 18.4241,
                area: "Cape Town Metro"
            },
            status: this.currentLoad > 85 ? "CRITICAL" : 
                   this.currentLoad > 70 ? "HIGH" : 
                   this.currentLoad > 50 ? "MEDIUM" : "NORMAL"
        };
    }
    
    /**
     * Generate realistic temperature for Cape Town
     */
    generateTemperature(hour) {
        // Cape Town average temperatures by hour
        const baseTempCurve = {
            0: 15, 1: 14, 2: 13, 3: 12, 4: 12, 5: 13,
            6: 14, 7: 16, 8: 19, 9: 22, 10: 25, 11: 27,
            12: 29, 13: 30, 14: 31, 15: 30, 16: 28, 17: 26,
            18: 24, 19: 22, 20: 20, 21: 18, 22: 17, 23: 16
        };
        
        const baseTemp = baseTempCurve[hour] || 20;
        const seasonalVariation = Math.sin((Date.now() / (1000 * 60 * 60 * 24 * 30)) * Math.PI * 2) * 8;
        const dailyVariation = (Math.random() - 0.5) * 4;
        
        return Math.max(5, Math.min(40, baseTemp + seasonalVariation + dailyVariation));
    }
    
    /**
     * Predict next hour load using simple ML-like logic
     * In production, this would be a trained XGBoost/Neural Network
     */
    predictNextHourLoad(currentData) {
        const currentHour = new Date().getHours();
        const nextHour = (currentHour + 1) % 24;
        const currentLoad = currentData.currentLoad;
        
        // Simple trend analysis
        const loadTrend = this.analyzeTrend();
        
        // Time-based prediction
        let basePrediction;
        if (nextHour >= 6 && nextHour <= 9) {
            basePrediction = currentLoad * 1.15; // Morning peak coming
        } else if (nextHour >= 17 && nextHour <= 20) {
            basePrediction = currentLoad * 1.25; // Evening peak coming
        } else if (nextHour >= 22 || nextHour <= 5) {
            basePrediction = currentLoad * 0.8; // Night time reduction
        } else {
            basePrediction = currentLoad * 1.02; // Slight increase during day
        }
        
        // Apply trend
        basePrediction *= (1 + loadTrend);
        
        // Add weather impact (simplified)
        const tempImpact = currentData.temperature > 28 ? 1.1 : 
                          currentData.temperature < 12 ? 1.05 : 1.0;
        basePrediction *= tempImpact;
        
        // Add some uncertainty
        const uncertainty = (Math.random() - 0.5) * 10;
        const prediction = Math.max(20, Math.min(100, basePrediction + uncertainty));
        
        // Calculate confidence based on historical accuracy (mock)
        const confidence = this.calculatePredictionConfidence(currentData, prediction);
        
        return {
            predictedLoad: Math.round(prediction * 100) / 100,
            confidence: Math.round(confidence),
            riskLevel: prediction > 85 ? "CRITICAL" : 
                      prediction > 70 ? "HIGH" : 
                      prediction > 50 ? "MEDIUM" : "LOW",
            recommendation: this.getRecommendation(prediction),
            factors: {
                timeOfDay: nextHour >= 17 && nextHour <= 20 ? "EVENING_PEAK" : 
                          nextHour >= 6 && nextHour <= 9 ? "MORNING_PEAK" : "NORMAL",
                weather: tempImpact > 1.05 ? "HIGH_DEMAND_WEATHER" : "NORMAL_WEATHER",
                trend: loadTrend > 0.05 ? "INCREASING" : loadTrend < -0.05 ? "DECREASING" : "STABLE"
            },
            timestamp: Date.now() + 3600000 // 1 hour ahead
        };
    }
    
    /**
     * Analyze load trend (simplified)
     */
    analyzeTrend() {
        // In production, would analyze historical data
        // For MVP, simulate trend analysis
        return (Math.random() - 0.5) * 0.1; // -5% to +5% trend
    }
    
    /**
     * Calculate prediction confidence
     */
    calculatePredictionConfidence(currentData, prediction) {
        let confidence = 80; // Base confidence
        
        // Higher confidence during stable periods
        if (currentData.status === "NORMAL" || currentData.status === "MEDIUM") {
            confidence += 10;
        }
        
        // Lower confidence during critical periods (more volatile)
        if (currentData.status === "CRITICAL") {
            confidence -= 15;
        }
        
        // Weather stability affects confidence
        if (currentData.temperature > 15 && currentData.temperature < 28) {
            confidence += 5; // Mild weather = more predictable
        }
        
        // Add some randomness
        confidence += (Math.random() - 0.5) * 10;
        
        return Math.max(60, Math.min(95, confidence));
    }
    
    /**
     * Get recommendation based on predicted load
     */
    getRecommendation(predictedLoad) {
        if (predictedLoad > 85) {
            return {
                action: "IMMEDIATE_REDUCTION",
                urgency: "CRITICAL",
                targetReduction: "15-20 kWh",
                incentiveMultiplier: 3,
                message: "Transformer overload imminent! Reduce consumption immediately.",
                timeWindow: "Next 30 minutes"
            };
        } else if (predictedLoad > 70) {
            return {
                action: "VOLUNTARY_REDUCTION",
                urgency: "HIGH",
                targetReduction: "8-12 kWh",
                incentiveMultiplier: 2,
                message: "High load predicted. Consider reducing non-essential usage.",
                timeWindow: "Next hour"
            };
        } else if (predictedLoad > 60) {
            return {
                action: "OPTIMIZATION",
                urgency: "MEDIUM",
                targetReduction: "3-5 kWh",
                incentiveMultiplier: 1.5,
                message: "Good time to optimize energy usage for rewards.",
                timeWindow: "Next 2 hours"
            };
        } else {
            return {
                action: "NORMAL_OPERATION",
                urgency: "LOW",
                targetReduction: "0 kWh",
                incentiveMultiplier: 1,
                message: "Normal operations. Consider buying cheap P2P energy.",
                timeWindow: "No urgency"
            };
        }
    }
    
    /**
     * Start automated data generation (for demo)
     */
    startDataGeneration(callback, intervalMs = 30000) { // 30 seconds default
        if (this.isRunning) {
            console.log("Data generation already running");
            return;
        }
        
        console.log("🎭 Starting mock data generation...");
        this.isRunning = true;
        
        // Generate initial data
        const initialData = this.generateTransformerData();
        if (callback) callback(initialData);
        
        // Set up interval
        this.intervalId = setInterval(() => {
            const data = this.generateTransformerData();
            if (callback) callback(data);
        }, intervalMs);
    }
    
    /**
     * Stop data generation
     */
    stopDataGeneration() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        console.log("🛑 Mock data generation stopped");
    }
    
    /**
     * Generate historical data for testing
     */
    generateHistoricalData(hours = 24) {
        const data = [];
        const now = Date.now();
        
        for (let i = hours; i > 0; i--) {
            const timestamp = now - (i * 3600000); // Hours ago
            const date = new Date(timestamp);
            const hour = date.getHours();
            
            // Generate data for that time
            const historicalLoad = this.getHistoricalLoad(hour);
            const historicalTemp = this.getHistoricalTemp(hour);
            
            data.push({
                timestamp,
                load: historicalLoad,
                temperature: historicalTemp,
                hour: hour,
                status: historicalLoad > 85 ? "CRITICAL" : 
                       historicalLoad > 70 ? "HIGH" : 
                       historicalLoad > 50 ? "MEDIUM" : "NORMAL"
            });
        }
        
        return data;
    }
    
    getHistoricalLoad(hour) {
        const peakHours = [7, 8, 18, 19, 20];
        const lowHours = [0, 1, 2, 3, 4, 5];
        
        if (peakHours.includes(hour)) {
            return 70 + Math.random() * 20; // 70-90%
        } else if (lowHours.includes(hour)) {
            return 30 + Math.random() * 15; // 30-45%
        } else {
            return 45 + Math.random() * 20; // 45-65%
        }
    }
    
    getHistoricalTemp(hour) {
        // Simplified historical temperature
        return 15 + Math.sin((hour / 24) * Math.PI * 2) * 8 + (Math.random() - 0.5) * 4;
    }
}

module.exports = MockDataService;
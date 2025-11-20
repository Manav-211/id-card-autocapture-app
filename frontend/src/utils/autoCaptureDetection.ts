

export interface QualityMetrics {
  sharpness: number;
  edgeArea: number;
  isReadyToCapture: boolean;
}

export interface AutoCaptureConfig {
  minSharpness: number;
  minEdgeArea: number;
  stabilityFrames: number;
  captureInterval: number;
}

const DEFAULT_CONFIG: AutoCaptureConfig = {
  minSharpness: 1000,
  minEdgeArea: 5,
  stabilityFrames: 2,
  captureInterval: 1000,
};

class AutoCaptureDetector {
  private config: AutoCaptureConfig;
  private consecutiveGoodFrames: number = 0;
  private lastCaptureTime: number = 0;

  constructor(config: Partial<AutoCaptureConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }


  isQualityGood(metrics: QualityMetrics): boolean {
    return (
      metrics.sharpness >= this.config.minSharpness &&
      metrics.edgeArea >= this.config.minEdgeArea
    );
  }

  updateFrame(metrics: QualityMetrics): boolean {
    const isGood = this.isQualityGood(metrics);

    if (isGood) {
      this.consecutiveGoodFrames++;
    } else {
      this.consecutiveGoodFrames = 0;
    }


    const shouldCapture =
      this.consecutiveGoodFrames >= this.config.stabilityFrames &&
      Date.now() - this.lastCaptureTime >= this.config.captureInterval;

    if (shouldCapture) {
      this.lastCaptureTime = Date.now();
      this.consecutiveGoodFrames = 0; // Reset after capture
    }

    return shouldCapture;
  }


  getState() {
    return {
      consecutiveGoodFrames: this.consecutiveGoodFrames,
      lastCaptureTime: this.lastCaptureTime,
      isReady: this.consecutiveGoodFrames >= this.config.stabilityFrames,
    };
  }

  reset(): void {
    this.consecutiveGoodFrames = 0;
    this.lastCaptureTime = 0;
  }

 
  setConfig(config: Partial<AutoCaptureConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export default AutoCaptureDetector;

/**
 * Detect WebGPU support in the current browser environment.
 */
export interface WebGPUDetectResult {
  supported: boolean;
  reason?: string;
  adapter?: GPUAdapter;
  device?: GPUDevice;
}

let cachedResult: WebGPUDetectResult | null = null;
let detectPromise: Promise<WebGPUDetectResult> | null = null;

export async function detectWebGPU(): Promise<WebGPUDetectResult> {
  if (cachedResult) return cachedResult;
  if (detectPromise) return detectPromise;

  detectPromise = (async () => {
    if (!navigator.gpu) {
      cachedResult = { supported: false, reason: 'WebGPU API not available' };
      return cachedResult;
    }

    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        cachedResult = { supported: false, reason: 'No GPU adapter found' };
        return cachedResult;
      }

      const device = await adapter.requestDevice();
      if (!device) {
        cachedResult = { supported: false, reason: 'Failed to get GPU device' };
        return cachedResult;
      }

      cachedResult = { supported: true, adapter, device };
      return cachedResult;
    } catch (e) {
      cachedResult = {
        supported: false,
        reason: e instanceof Error ? e.message : 'Unknown WebGPU error',
      };
      return cachedResult;
    }
  })();

  return detectPromise;
}

/**
 * Returns the cached detection result, or null if detection hasn't completed yet.
 */
export function getWebGPUDetectResult(): WebGPUDetectResult | null {
  return cachedResult;
}

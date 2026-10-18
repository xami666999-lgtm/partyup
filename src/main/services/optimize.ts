import type { IpcMain } from 'electron'
export class OptimizationService {
  register(ipc: IpcMain) {
    ipc.handle('opt:tools', () => ['Special K', 'Lossless Scaling', 'OptiScaler', 'MangoHud', 'Process Lasso'])
  }
}

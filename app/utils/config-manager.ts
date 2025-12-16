// 配置管理模块，用于处理 Chroma 服务的运行时配置

class ConfigManager {
  private static instance: ConfigManager;
  private config: { host: string | null; port: number | null };

  private constructor() {
    // 初始化为空值，强制用户配置
    this.config = {
      host: typeof window !== 'undefined' ? localStorage.getItem('chromaHost') : null,
      port: typeof window !== 'undefined' ? parseInt(localStorage.getItem('chromaPort') || '') : null
    };

    // 如果 localStorage 中没有有效值，则设为 null
    if (this.config.port && isNaN(this.config.port)) {
      this.config.port = null;
    }
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  getConfig() {
    return { ...this.config };
  }

  updateConfig(host: string, port: number) {
    this.config.host = host;
    this.config.port = port;

    // 在浏览器环境中保存到 localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('chromaHost', host);
      localStorage.setItem('chromaPort', port.toString());
    }
  }

  // 检查配置是否完整
  isConfigured(): boolean {
    return this.config.host !== null && this.config.host !== '' &&
           this.config.port !== null && !isNaN(this.config.port);
  }
}

export default ConfigManager;

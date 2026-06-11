// Critical Resource Preloader — caches preloaded image URLs so repeat
// requests (e.g. reopening a project modal) resolve instantly.
export class ResourcePreloader {
  private static instance: ResourcePreloader;
  private preloadedResources = new Set<string>();

  static getInstance(): ResourcePreloader {
    if (!ResourcePreloader.instance) {
      ResourcePreloader.instance = new ResourcePreloader();
    }
    return ResourcePreloader.instance;
  }

  preloadImage(src: string, priority: 'high' | 'low' = 'low'): Promise<void> {
    if (this.preloadedResources.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.preloadedResources.add(src);
        resolve();
      };
      img.onerror = reject;

      if (priority === 'high') {
        img.fetchPriority = 'high';
      }

      img.src = src;
    });
  }

  preloadImages(sources: string[]): Promise<void[]> {
    return Promise.all(sources.map(src => this.preloadImage(src)));
  }
}

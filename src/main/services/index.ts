export async function initializeServices(
  services: any,
  store: any,
  database: any,
  pluginManager: any
) {
  const initPromises = Object.entries(services).map(async ([name, service]) => {
    if (service && typeof service.initialize === 'function') {
      try {
        await service.initialize(store, database, pluginManager);
        console.log(`Service ${name} initialized`);
      } catch (error) {
        console.error(`Failed to initialize ${name}:`, error);
      }
    }
  });

  await Promise.all(initPromises);
}

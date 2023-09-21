import { Subscribable } from '../Base/base-classes';
import { StartupPayloadType } from './startup.types';
import { StartupData } from './startup';
declare class Sources extends Subscribable<{
    thing: 'sources-initialized' | 'sources-update';
}> {
    sources: StartupPayloadType['sources'];
    localSourceId: StartupPayloadType['localSourceId'];
    harvestedSources: StartupPayloadType['harvestedSources'];
    sourcePollInterval: StartupPayloadType['config']['sourcePollInterval'];
    disableLocalCatalog: StartupPayloadType['config']['disableLocalCatalog'];
    constructor(startupData?: StartupData);
    fetchSources: () => void;
    startPollingSources: () => void;
    updateSources: (sources?: StartupPayloadType['sources']) => void;
    setHarvestedSources: (harvestedSources?: string[]) => void;
}
export { Sources };

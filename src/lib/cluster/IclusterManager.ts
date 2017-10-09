import { TeventDispatcher } from '../events/TeventDispatcher';
import { Tevent } from '../events/Tevent';

export interface IclusterManager extends TeventDispatcher {

    isMasterProcess: boolean
    isClusterMaster: boolean
    isServerMaster: boolean
    start()
    getThisWorkerId(): string
    getClusterWorkers()
    initOnWorker()
    onLocalClusterMessage(message)
    getNewClient(db?)
    getClient()
}

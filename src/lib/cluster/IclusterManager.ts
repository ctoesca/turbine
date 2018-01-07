import { TeventDispatcher } from '../events/TeventDispatcher';
import { Tevent } from '../events/Tevent';

export interface IclusterManager extends TeventDispatcher {
    nodeID: string
    isMasterProcess: boolean
    isClusterMaster: boolean
    isServerMaster: boolean
    keyPrefix: string
    start()
    getThisWorkerId(): string
    getClusterWorkers()
    initOnWorker()
    onLocalClusterMessage(message)
    getNewClient(db?)
    getClient()
}

import { TbaseService } from './TbaseService';
import { Tapplication } from '../Tapplication';
import { Tservice as ThttpServer } from '../services/httpServer/Tservice';
import express = require('express');
export declare abstract class ThttpBaseService extends TbaseService {
    httpServer: ThttpServer;
    app: express.Application;
    constructor(name: string, application: Tapplication, config: any);
    start(): void;
    stop(): void;
}

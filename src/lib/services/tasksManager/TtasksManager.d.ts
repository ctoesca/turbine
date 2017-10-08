/// <reference types="express" />
import { TbaseService } from '../TbaseService';
import { Ttimer } from '../../tools/Ttimer';
import express = require('express');
export declare class TtasksManager extends TbaseService {
    httpServer: any;
    runningTasks: {};
    runningTasksDir: string;
    runningProcesses: {};
    refreshTimer: Ttimer;
    app: express.Application;
    constructor(name: any, server: any, config: any);
    getDefaultConfig(): {
        "active": boolean;
        "executionPolicy": string;
        "dataDir": string;
        "apiPath": string;
        "userAgent": string;
    };
    flatify(): Promise<{}>;
    start(): void;
    stop(): void;
    execTask(task: any, endCallback?: any): any;
    searchTask(f: any): any;
    killTask(id: string): void;
    fileExists(path: any): boolean;
    removeTask(id: any): void;
    saveTask(task: any): void;
    loadTasks(): void;
    pidIsRunning(pid: any): boolean | void;
    getRunningTaskByPID(pid: any): any;
    getRunningTaskByID(id: any): any;
    checkTasks(): void;
    sendCallback(task: any, eventName: any, callback: any): void;
    onRefreshTimer(): void;
    _startTask(req: express.Request, res: express.Response): void;
    _startTaskSync(req: express.Request, res: express.Response): void;
    _killTask(req: express.Request, res: express.Response): void;
}

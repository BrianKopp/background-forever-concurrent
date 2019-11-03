import { EventEmitter } from 'events';
import { BackgroundForeverOptions, BackgroundForever } from 'background-forever';

export class BackgroundForeverConcurrent extends EventEmitter {
    private bfTasks: BackgroundForever[];
    constructor(
        private concurrency: number,
        private foreverFunction: () => Promise<any>,
        private bfOpts: BackgroundForeverOptions
    ) {
        super();
        this.setupSubTasks();
    }
    private setupSubTasks() {
        this.bfTasks = [];
        for (let i = 0; i < this.concurrency; i++) {
            const bf = new BackgroundForever(this.foreverFunction, this.bfOpts);
            bf.on('beforeRun', (runCount: number) => {
                this.emit('beforeRun', { runCount, which: i });
            });
            bf.on('runSuccess', (res: any) => {
                this.emit('runSuccess', { result: res, which: i });
            });
            bf.on('runError', (err: any) => {
                this.emit('runError', { err, which: i });
            });
        }
    }
    public start() {
        this.bfTasks.forEach((task: BackgroundForever) => task.start());
    }
    public stop(): Promise<void> {
        const completions = this.bfTasks.map((task: BackgroundForever) => {
            return new Promise<boolean>((resolve, _) => {
                task.stop().then(() => {
                    resolve(true);
                }).catch((__) => {
                    resolve(false);
                });
            });
        });
        return new Promise<void>((resolve, reject) => {
            Promise.all(completions).then((results) => {
                const failures = results.filter((r) => r);
                if (failures.length) {
                    reject(failures.length + ' concurrent tasks failed to complete within shutdown time');
                } else {
                    resolve();
                }
            }).catch((err) => {
                console.error('should be impossible to reach this point. error: ', err);
                reject(err);
            });
        });
    }
}

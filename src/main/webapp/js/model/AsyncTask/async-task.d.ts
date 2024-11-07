import { Subscribable } from '../Base/base-classes';
import { LazyQueryResult } from '../LazyQueryResult/LazyQueryResult';
type PlainMetacardPropertiesType = LazyQueryResult['plain']['metacard']['properties'];
type MinimalPropertySet = Partial<PlainMetacardPropertiesType> & {
    title: PlainMetacardPropertiesType['title'];
};
export declare const convertToBackendCompatibleForm: ({ properties, }: {
    properties: MinimalPropertySet;
}) => MinimalPropertySet;
type AsyncSubscriptionsType = {
    thing: 'update';
};
/**
 *  Provides a singleton for tracking async tasks in the UI
 */
declare class AsyncTasksClass extends Subscribable<{
    thing: 'add' | 'remove' | 'update';
}> {
    list: Array<AsyncTask>;
    constructor();
    delete({ lazyResult }: {
        lazyResult: LazyQueryResult;
    }): DeleteTask;
    restore({ lazyResult }: {
        lazyResult: LazyQueryResult;
    }): RestoreTask;
    create({ data, metacardType, }: {
        data: MinimalPropertySet;
        metacardType: string;
    }): CreateTask;
    save({ lazyResult, data, metacardType, }: {
        data: PlainMetacardPropertiesType;
        lazyResult: LazyQueryResult;
        metacardType: string;
    }): SaveTask;
    createSearch({ data }: {
        data: PlainMetacardPropertiesType;
    }): CreateSearchTask;
    saveSearch({ lazyResult, data, }: {
        data: PlainMetacardPropertiesType;
        lazyResult: LazyQueryResult;
    }): SaveSearchTask;
    isRestoreTask(task: AsyncTask): task is RestoreTask;
    isDeleteTask(task: AsyncTask): task is DeleteTask;
    isCreateTask(task: AsyncTask): task is CreateTask;
    isSaveTask(task: AsyncTask): task is SaveTask;
    isCreateSearchTask(task: AsyncTask): task is CreateSearchTask;
    isSaveSearchTask(task: AsyncTask): task is SaveSearchTask;
    hasShowableTasks(): boolean;
    private add;
    remove(asyncTask: AsyncTask): void;
}
export declare const AsyncTasks: AsyncTasksClass;
/**
 * Goal is to provide a common abstraction to track long running async tasks in the UI, and free up the user to do whatever they want during them.
 * Through subscriptions, we'll allow views to track progress if necessary. (useTaskProgress hooks?)
 */
declare abstract class AsyncTask extends Subscribable<AsyncSubscriptionsType> {
    constructor();
}
export declare const useRenderOnAsyncTasksAddOrRemove: () => void;
export declare const useRestoreSearchTaskBasedOnParams: () => RestoreTask | null;
export declare const useRestoreSearchTask: ({ id }: {
    id?: string | undefined;
}) => RestoreTask | null;
export declare const useCreateTaskBasedOnParams: () => CreateTask | null;
export declare const useCreateTask: ({ id }: {
    id?: string | undefined;
}) => CreateTask | null;
export declare const useSaveTaskBasedOnParams: () => SaveTask | null;
export declare const useSaveTask: ({ id }: {
    id?: string | undefined;
}) => SaveTask | null;
export declare const useCreateSearchTaskBasedOnParams: () => CreateSearchTask | null;
export declare const useCreateSearchTask: ({ id }: {
    id?: string | undefined;
}) => CreateSearchTask | null;
export declare const useSaveSearchTaskBasedOnParams: () => CreateSearchTask | null;
export declare const useSaveSearchTask: ({ id }: {
    id?: string | undefined;
}) => CreateSearchTask | null;
/**
 * Pass an async task that you want updates for.  Each update will cause your component to rerender,
 * and then you can then check whatever you want to about the task.
 */
export declare const useRenderOnAsyncTaskUpdate: ({ asyncTask, }: {
    asyncTask: AsyncTask;
}) => void;
declare class RestoreTask extends AsyncTask {
    lazyResult: LazyQueryResult;
    constructor({ lazyResult }: {
        lazyResult: LazyQueryResult;
    });
    attemptRestore(): void;
    static isInstanceOf(task: any): task is RestoreTask;
}
declare class DeleteTask extends AsyncTask {
    lazyResult: LazyQueryResult;
    constructor({ lazyResult }: {
        lazyResult: LazyQueryResult;
    });
    attemptDelete(): void;
    static isInstanceOf(task: any): task is DeleteTask;
}
declare class CreateTask extends AsyncTask {
    metacardType: string;
    data: MinimalPropertySet;
    constructor({ data, metacardType, }: {
        data: MinimalPropertySet;
        metacardType: string;
    });
    attemptSave(): void;
    static isInstanceOf(task: any): task is CreateTask;
}
declare class SaveTask extends AsyncTask {
    metacardType: string;
    lazyResult: LazyQueryResult;
    data: PlainMetacardPropertiesType;
    controller: AbortController;
    timeoutid: number | undefined;
    constructor({ lazyResult, data, metacardType, }: {
        lazyResult: LazyQueryResult;
        data: PlainMetacardPropertiesType;
        metacardType: string;
    });
    update({ data }: {
        data: PlainMetacardPropertiesType;
    }): void;
    attemptSave(): void;
    static isInstanceOf(task: any): task is SaveTask;
}
declare class CreateSearchTask extends AsyncTask {
    lazyResult?: LazyQueryResult;
    data: LazyQueryResult['plain']['metacard']['properties'];
    constructor({ data, }: {
        data: LazyQueryResult['plain']['metacard']['properties'];
    });
    attemptSave(): void;
    static isInstanceOf(task: any): task is CreateSearchTask;
}
declare class SaveSearchTask extends AsyncTask {
    lazyResult: LazyQueryResult;
    data: PlainMetacardPropertiesType;
    controller: AbortController;
    timeoutid: number | undefined;
    constructor({ lazyResult, data, }: {
        lazyResult: LazyQueryResult;
        data: PlainMetacardPropertiesType;
    });
    update({ data }: {
        data: PlainMetacardPropertiesType;
    }): void;
    attemptSave(): void;
    static isInstanceOf(task: any): task is SaveSearchTask;
}
export {};

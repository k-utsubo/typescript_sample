/// <reference path="jquery.d.ts" />
/// <reference path="underscore.d.ts" />
/// <reference path="backbone.d.ts" />

declare module Backbone {
    class Action extends Backbone.Model {
        undo(undoTypes: any):void;
        redo(undoTypes: any):void;
    }

    class UndoStack extends Backbone.Collection<any> {
        setMaxLength(val:number): void;

    }

    class UndoManager extends Backbone.Model{
        stack: UndoStack;
        constructor(attr?: any);
        startTracking(): void;
        stopTracking(): void;
        register(): void;
        unregister(): void;
        unregisterAll(): void;
        undo(magic?: any): void;
        redo(magic?: any): void;
        isAvailable(type: any): boolean;
        merge(undoManager: any): void;
        addUndoType(type: string, fns: any): void;
        changeUndoType(type: string, fns: any): void;
        removeUndoType(type: string): void;
        clear(): void;
    }
}
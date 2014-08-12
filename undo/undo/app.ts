/// <reference path="jquery.d.ts" />
/// <reference path="backbone.d.ts" />
/// <reference path="backbone.undo.d.ts" />
/// <reference path="underscore.d.ts" />

module sample {
    var undoButton = $("#undo");
    var redoButton = $("#redo");
    var addButton = $("#add");
    var updateNameButton = $("#update_name");
    var updateValueButton = $("#update_value");
    var itemButton = $("#item_button");
    var attrButton = $("#attr_button");

    export class App {
        private listview: ItemListView;
        private appModel: AppModel;
        constructor() {
            var self = this;
            self.appModel = new AppModel();

            self.listview = new ItemListView({
                "appModel": self.appModel      // collectionのエイリアスを持つのではダメ、ポインタが書き換わるため
            });

            undoButton.click(function () {
                console.log("undoButton.click");
                self.appModel.undoHandler.undo();
                self.draw();
            });
            redoButton.click(function () {
                console.log("redoButton.click");
                self.appModel.undoHandler.redo();
                self.draw();
            });

            addButton.click(function () {
                console.log("addButton.click");
                var ary = <Array<any>>self.appModel.get("collection");
                var newary = new Array<any>();// 新しくオブジェクトを作らないとstack.onしない
                ary.forEach(function (item) {
                    newary.push(item);
                });
                newary.push({ "name": "0", "value": "0" });
                self.appModel.set({ "collection": newary });
                //self.listview.list = self.appModel.get("collection");
                self.draw();
            });

            updateNameButton.click(function () {
                console.log("updateNameButton.click");
                var newary = new Array<any>();
                self.appModel.get("collection").forEach(function (item) {
                    newary.push({"value":item.value,"name":_.random(100).toString() }); // 新しくオブジェクトを作らないとstack.onしない
                });
                self.appModel.set({ "collection": newary });
                self.draw();
            });
            updateValueButton.click(function () {
                console.log("updateValueButton.click");
                var newary = new Array<any>();
                self.appModel.get("collection").forEach(function (item) {
                    newary.push({ "name": item.name, "value": _.random(100).toString() });
                });
                self.appModel.set({ "collection": newary });
                self.draw();
            });

            itemButton.click(function () {
                console.log("itemButton.click");
                self.appModel.set({
                    "item_item": { "item_name": _.random(100).toString(), "item_value": _.random(100).toString() }
                });
                self.draw();
            });
            attrButton.click(function () {
                console.log("attrButton.click");
                self.appModel.set({ "attr": _.random(100).toString() });
                self.draw();
            });

        }

        draw(): void {
            console.log("draw");
            this.listview.render();
            $("#item_name").text(this.appModel.get("item_item").item_name);
            $("#item_value").text(this.appModel.get("item_item").item_value);
            $("#attr").text(this.appModel.get("attr"));
        }
    }

    export class AppModel extends Backbone.Model {
        undoHandler: UndoHandler;

        constructor(options?) {
            super(options);
            this.undoHandler = new UndoHandler(this);
            this.bind("change", this.change);
            
        }
        defaults() {
            return {
                collection:[
                    { "name": "0", "value": "0" }
                ],
                item_item: {
                    "item_name": "",
                    "item_value":""
                },
                attr:"",
            }
        }

        change(): void {

            console.log("AppModel.change");
        }

    }

    export class UndoHandler {
        private manager: Backbone.UndoManager;
         constructor(collections:any) {


            var self = this;
             self.manager = new Backbone.UndoManager({ register: collections, track: true });

             self.manager.removeUndoType("change:isChanging");
             self.manager.addUndoType("change:isChanging", {
                "on": function (model, isChanging, options) {
                    console.log("manager.addUndoType.on");
                },
                "undo": function (model, before, after, options) {
                    console.log("manager.addUndoType.undo");
                    model.set(before)
                },
                "redo": function (model, before, after, options) {
                    console.log("manager.addUndoType.redo");
                    model.set(after)
                }
            });


             self.manager.on("all", function (type) {
                console.log("all.type:" + type);
                switch (type) {
                    case "undo": {
                        console.log("undo");
                        break;
                    }
                    case "redo": {
                        console.log("redo");
                        break;
                    }
                }
            });
             self.manager.trigger("undo redo");

             self.manager.stack.on("add", function () {
                console.log("stack.on.add");
            });

            

         }
        undo(): void{
            this.manager.undo(true);
        }
        redo(): void {
            this.manager.redo(true);
        }
    }


    class ItemModel extends Backbone.Model {
        constructor(options?) {
            if (options) {
                if (options.name) this.set({ "name": options.name }, { "validate": true });
                if (options.value) this.set({ "value": options.value }, { "validate": true });
            }
            super(options);
            this.bind("change", this.change);
        }
        change(): void {
            console.log("ItemModel.change:name="+this.get("name")+",value="+this.get("value"));
        }
        defaults() {
	        return {
                "id": _.uniqueId(),
                "name": "",
                "value":""
            }
        }
        validate(attrs) {
            if (!attrs.name || _.isEmpty(attrs.name)) {
                return "name must not be empty";
            }
            if (!attrs.value || _.isEmpty(attrs.value)) {
                return "value must not be empty";
            }
        }
    }

    class ItemCollection extends Backbone.Collection<ItemModel>{
        constructor(options) {
            super(options);
        }
    }

    class ItemView extends Backbone.View<ItemModel> {
        template: (data: any) => string;
        constructor(options?) {
            var html = $("#template-item").html();
            this.template = _.template(html);
            this.events = <any>{
                "click": "onclick",
                "change":"onchange"
            };
            super(options);
            this.model.bind("change", this.render, this);
        }
        private onclick() {
            console.log("ItemView.onclick");
        }
        private change() {
            console.log("ItemView.onchange");
            this.render();
        }

        render(): ItemView {
            var html = this.template(this.model.toJSON());
            $(this.el).html(html);
            return this;
        }

    }

    class ItemListView extends Backbone.View<ItemModel>{
        appModel: any; // backbone.model
        constructor(options?) {
            var self = this;
            this.el = "#item-list";
            if (options) {
                if (options.appModel) this.appModel = options.appModel;
            }
            
            this.collection = new Backbone.Collection<ItemModel>();
            this.appModel.get("collection").forEach(function (item) {
                self.collection.add(new ItemModel(item));
            });

            super(options);
            this.listenTo(this.collection, 'add', this.render);
            this.listenTo(this.collection, 'remove', this.render);
            this.listenTo(this.collection, 'reset', this.render);
        }
        render(): ItemListView {
            var el = $(this.el);
            el.empty();
            var self = this;

            self.collection = new Backbone.Collection<ItemModel>();
            this.appModel.get("collection").forEach(function (item) {
                self.collection.add(new ItemModel(item));
            });
            this.collection.forEach(item=> {
                console.log("ItemListView.render");
                var view=new ItemView({ "model": item }).render();
                el.append(view.el);
            });
            return this;
        }
    }
}

new sample.App().draw();





///<reference path='mocha.d.ts' />
///<reference path='assert.d.ts' />


module sample {

    describe("テスト", () => {

        it("UndoRedoTest", (done) => {// done:これで同期でテストできる

            var model = new AppModel();
            
            // どうやらBackboneUndoはタイムスタンプを用いているらしいので同じ時刻にstack.onした場合には認識できない
            setTimeout(() => {
                model.set({ "attr": "attrvalue" });
                assert(model.get("attr") == "attrvalue");
                console.log("attr:" + model.get("attr"));

                setTimeout(() => {
                    model.set({
                        "item_item": { "item_name": "item_name1", "item_value": "item_value1" }
                    });
                    assert(model.get("item_item").item_name == "item_name1");
                    console.log("item_item.item_name:" + model.get("item_item").item_name);
 
                    setTimeout(() => {
                        // undo
                        model.undoHandler.undo();
                        assert(model.get("item_item").item_name == "");
                        console.log("item_item.item_name:" + model.get("item_item").item_name);

                        setTimeout(() => {
                            // redo
                            model.undoHandler.redo();
                            assert(model.get("item_item").item_value == "item_value1");
                            console.log("item_item.item_value:" + model.get("item_item").item_value);

                            done(); // これで同期でテストできる

                        }, 100);

                    }, 100);

                }, 100);


            }, 100);

        });

    });
}

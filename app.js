//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

/*mongoose.connect("mongodb://127.0.0.1:27017/todolistDB").then(() => {
  console.log("connected");
});*/

mongoose.connect("mongodb+srv://mohiniagarwal1408:Mohiniatlas123@cluster0.xu5sddz.mongodb.net/todolistDB").then(() => {
  console.log("connected");
});


const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!",
});

const item2 = new Item({
  name: "Hit the + button to add a new item.",
});

const item3 = new Item({
  name: "<-- Hit this to delete an item.",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find()
    .then(function (foundItems) {
      if (foundItems.length == 0) {
        Item.insertMany(defaultItems)
          .then(function () {
            console.log("Successfully saved default items to database");
          })
          .catch(function (err) {
            console.log(err);
          });
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItems: foundItems });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName })
    .then((foundList) => {
      if (foundList) {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      } else {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      }
    })
    .catch((err) => console.log(err.body));
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName == "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName })
      .then(function (foundList) {
        let foundListArray = foundList.items;
        foundListArray.push(item);
        foundList.save();
        res.redirect("/" + listName);
      })
      .catch(function (err) {
        console.log(err);
      });
  }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName == "Today") {
    Item.findByIdAndRemove(checkedItemId)
      .then(function () {
        console.log("Successfully deleted checked items!");
        res.redirect("/");
      })
      .catch(function (err) {
        console.log(err);
      });
  } else {
    List.findOne({ name: listName }).then(function (result) {
      result.items.pull(checkedItemId);
      result.save();
      res.redirect("/" + listName);
    })
    .catch(function(err){
      console.log(err);
    });
  }
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});

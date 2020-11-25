//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-anurag:20675256@cluster0.ndeft.mongodb.net/todolistDB",{useNewUrlParser:true});
const itemsSchema={
  name:String
};

const Item =mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Welcome to our list"
});
const item2=new Item({
  name:"Hit + to add new task"
});
const item3=new Item({
  name:"<-- Hit to delete some task"
});
const defaultItems=[item1,item2,item3];


app.get("/", function(req, res) {
Item.find({},function(err,foundItems){
if(foundItems.length==0)
{
  Item.insertMany(defaultItems,function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log("Sucess");
    }
  });
res.redirect("/");
}
else
  {
  res.render("list", {listTitle: "Today", newListItems: foundItems});
}
});




});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
const item = new Item({
name:itemName
});

if(listName==="Today"){
  item.save();
  res.redirect("/");
}else{

   List.findOne({name:listName},function(err,foundList){
   foundList.items.push(item);
   foundList.save();
   res.redirect("/"+listName);
   })
}

});

const listSchema={
  name:String,
  items:[itemsSchema]
};
const List=mongoose.model("List",listSchema);

app.get("/:customListName",function(req,res){
const customListName=_.capitalize(req.params.customListName);
List.findOne({name:customListName},function(err,results){

  if(!err){
    if(!results){

      const list=new List({
        name:customListName,
        items:defaultItems
      });
      list.save();
        res.redirect("/"+customListName);
    }
    else
    {
      res.render("list",{listTitle:results.name,newListItems:results.items})
    }
  }
});

});






app.get("/about", function(req, res){
  res.render("about");
});


app.post("/delete",function(req,res){
 const checkeditemID=req.body.checkbox;
const listName=req.body.listName;

if(listName==="Today")
{

   Item.findByIdAndRemove( checkeditemID , function (err) {
    if(!err){
  console.log("Sucessfuly deleted");
res.redirect("/");
    }

});
}
else
{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkeditemID}}},function(err,foundList){
    if(!err){
      res.redirect("/"+listName);
    }
  });
}



});
let port=process.env.PORT;
if(port==null||port==""){
  port=3000;
}



app.listen(port, function() {
  console.log("Server started on port 3000");
});

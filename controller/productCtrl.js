const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify=require("slugify");
const createProduct = asyncHandler(async (req, res) => {
    try {
      if (req.body.title) {
        req.body.slug = slugify(req.body.title);
      }
      const newProduct = await Product.create(req.body);
      res.json(newProduct);
    } catch (error) {
      throw new Error(error);
    }
  });
  const updateProduct = asyncHandler(async (req, res) => {
    const {id} = req.params;
    console.log("id",id);
    //validateMongoDbId(id);
    try {
        const updateProduct = await Product.findByIdAndUpdate(
          id,
          {
            title: req?.body?.title,
            brand: req?.body?.brand,
            price: req?.body?.price,

            
          },
          {
            new: true,
          }
        );
        res.json(updateProduct);
      } catch (error) {
        throw new Error(error);
      }
  });
  const deleteProduct = asyncHandler(async (req, res) => {
    const {id} = req.params;
   // validateMongoDbId(id);
    try {
      const deleteProduct = await Product.findOneAndDelete(id);
      res.json({
        deleteProduct,
      });
    } catch (error) {
      throw new Error(error);
    }
  });
  const getaProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    //validateMongoDbId(id);
    try {
      const findProduct = await Product.findById(id);
      res.json(findProduct);
    } catch (error) {
      throw new Error(error);
    }
  });
  const getAllProduct=asyncHandler(async(req,res)=>{

    try{
      const queryObj={...req.query};
     
      const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);
    //console.log(queryObj,req.query);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    //console.log(JSON.parse(queryStr));
    let query = Product.find(JSON.parse(queryStr));

    // Sorting

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }
        //const getallProducts=await Product.where("category").equals(req.query.category);
        const product=await query;
        res.json(product)
        res.json(getallProducts)
    }
    catch(error){
        throw new Error(error)
    }
  });
  
module.exports={createProduct,getaProduct,getAllProduct,updateProduct,deleteProduct }
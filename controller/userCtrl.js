
const User=require("../models/userModel")
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const uniqid = require("uniqid");
const asyncHandler=require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const validateMongoDbId = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshtoken");
const cookieParser = require("cookie-parser");
const jwt=require("jsonwebtoken")
const crypto=require("crypto");
const sendEmail = require("./emailCtrl");
const Product = require("../models/productModel");

const createUser = asyncHandler(async (req, res) => {
    
    const email = req.body.email;
   
    const findUser = await User.findOne({ email: email });
  
    if (!findUser) {
     
      const newUser = await User.create(req.body);
      res.json(newUser);
    } else {
      
      throw new Error("User Already Exists");
    }
  });
  const loginUserCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken=await generateRefreshToken(findUser?._id);
    const updateuser=await User.findByIdAndUpdate(findUser.id,{refreshToken:refreshToken},{new:true});
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
      });
      
    res.json({
        _id: findUser?._id,
        firstname: findUser?.firstname,
        lastname: findUser?.lastname,
        email: findUser?.email,
        mobile: findUser?.mobile,
        token: generateToken(findUser?._id),
      });
    }
    else{
        throw new Error("Invalid Credentials");

    }});

    
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if user exists or not
  const findAdmin = await User.findOne({ email });
  if (findAdmin.role !== "admin") throw new Error("Not Authorised");
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findAdmin?._id);
    const updateuser = await User.findByIdAndUpdate(
      findAdmin.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findAdmin?._id,
      firstname: findAdmin?.firstname,
      lastname: findAdmin?.lastname,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      token: generateToken(findAdmin?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});
    const handleRefreshToken = asyncHandler(async (req, res) => {
        const cookie = req.cookies;
        console.log(cookie);
        
        if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
        const refreshToken = cookie.refreshToken;
        const user = await User.findOne({ refreshToken });
        if (!user) throw new Error(" No Refresh token present in db or not matched");
        jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
          if (err || user.id !== decoded.id) {
            throw new Error("There is something wrong with refresh token");
          }
          const accessToken = generateToken(user?._id);
          res.json({ accessToken });
        });
      });
      const logout = asyncHandler(async (req, res) => {
        const cookie = req.cookies;
        if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
        const refreshToken = cookie.refreshToken;
        const user = await User.findOne({ refreshToken });
        if (!user) {
          res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
          });
          return res.sendStatus(204); // forbidden
        }
        await User.findOneAndUpdate(refreshToken, {
          refreshToken: " ",
        });
        res.clearCookie("refreshToken", {
          httpOnly: true,
          secure: true,
        });
        res.sendStatus(204); // forbidden
      });
      
    const updatedUser = asyncHandler(async (req, res) => {
        //console.log(req.user)
        const { _id } = req.user;
        validateMongoDbId(_id);
      
        try {
          const updatedUser = await User.findByIdAndUpdate(
            _id,
            {
              firstname: req?.body?.firstname,
              lastname: req?.body?.lastname,
              email: req?.body?.email,
              mobile: req?.body?.mobile,
            },
            {
              new: true,
            }
          );
          res.json(updatedUser);
        } catch (error) {
          throw new Error(error);
        }
      });
      const saveAddress = asyncHandler(async (req, res, next) => {
        const { _id } = req.user;
        validateMongoDbId(_id);
      
        try {
          const updatedUser = await User.findByIdAndUpdate(
            _id,
            {
              address: req?.body?.address,
            },
            {
              new: true,
            }
          );
          res.json(updatedUser);
        } catch (error) {
          throw new Error(error);
        }
      });
      
      const getallUser = asyncHandler(async (req, res) => {
        try {
          const getUsers = await User.find()
          res.json(getUsers);
        } catch (error) {
          throw new Error(error);
        }
      });
      
      // Get a single user
      
      const getaUser = asyncHandler(async (req, res) => {
        const { id } = req.params;
        validateMongoDbId(id);
      
        try {
          const getaUser = await User.findById(id);
          res.json({
            getaUser,
          });
        } catch (error) {
          throw new Error(error);
        }
      });
      
      // Get a single user
      
      const deleteaUser = asyncHandler(async (req, res) => {
        const { id } = req.params;
        validateMongoDbId(id);
      
        try {
          const deleteaUser = await User.findByIdAndDelete(id);
          res.json({
            deleteaUser,
          });
        } catch (error) {
          throw new Error(error);
        }
      });

      const blockUser=asyncHandler(async(req,res)=>{
        const{id}=req.params;
        validateMongoDbId(id);
        try{
            const block=await User.findByIdAndUpdate(id,{
                isBlocked:true},{
                new :true
            });
            res.json({message:"user blocked"});
        }
        catch{
            throw new Error(error);
        }
      });
      const unblockUser=asyncHandler(async(req,res)=>{
        const{id}=req.params;
        validateMongoDbId(id);
        try{
            const unblock=await User.findByIdAndUpdate(id,{
                isBlocked:true},{
                new :true
            });
            res.json({message:"user unblocked"});
        }
        catch{
            throw new Error(error);
        }
      });
      const updatePassword = asyncHandler(async (req, res) => {
        const { _id } = req.user;
        const { password } = req.body;
        validateMongoDbId(_id);
        const user = await User.findById(_id);
        if (password) {
          user.password = password;
          const updatedPassword = await user.save();
          res.json(updatedPassword);
        } else {
          res.json(user);
        }
      });
      
      const forgotPasswordToken = asyncHandler(async (req, res) => {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found with this email");
        try {
          const token = await user.createPasswordResetToken();
          await user.save();
          const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href='http://127.0.0.1:5000/api/user/reset-password-token/${token}'>Click Here</>`;
          const data = {
            to: email,
            text: "Hey User",
            subject: "Forgot Password Link",
            html: resetURL,
          };
          sendEmail(data);
          res.json(token);
        } catch (error) {
          throw new Error(error);
        }
      });
      
      const resetPassword = asyncHandler(async (req, res) => {
        const { password } = req.body;
        const { token } = req.params;
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({
          passwordResetToken: hashedToken,
          passwordResetExpires: { $gt: Date.now() },
        });
        if (!user) throw new Error(" Token Expired, Please try again later");
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        res.json(user);
      });
      const getWishlist = asyncHandler(async (req, res) => {
        const { _id } = req.user;
        try {
          const findUser = await User.findById(_id).populate("wishlist");
          res.json(findUser);
        } catch (error) {
          throw new Error(error);
        }
      });
      // const userCart = asyncHandler(async (req, res) => {
      //   const { cart } = req.body;
      //   const { _id } = req.user;
      //   validateMongoDbId(_id);
      
      //   try {
      //     let products = [];
      //     const user = await User.findById(_id);
      
      //     // Check if 'cart' is defined and has a length property
      //     if (!cart || !cart.length) {
      //       return res.status(400).json({ message: "Invalid cart data" });
      //     }
      
      //     // Check if user already has products in the cart
      //     const alreadyExistCart = await Cart.findOne({ orderby: user._id });
      
      //     if (alreadyExistCart) {
      //       // If the cart already exists, add new products to it
      //       for (let i = 0; i < cart.length; i++) {
      //         let object = {};
      //         object.product = cart[i]._id;
      //         object.count = cart[i].count;
      //         object.color = cart[i].color;
      //         let getPrice = await Product.findById(cart[i]._id).select("price").exec();
      //         object.price = getPrice.price;
      //         products.push(object);
      //       }
      
      //       alreadyExistCart.products = alreadyExistCart.products.concat(products);
      //       alreadyExistCart.cartTotal += calculateTotal(products);
      //       await alreadyExistCart.save();
      //       res.json(alreadyExistCart);
      //     } else {
      //       // Create a new cart if it doesn't exist
      //       for (let i = 0; i < cart.length; i++) {
      //         let object = {};
      //         object.product = cart[i]._id;
      //         object.count = cart[i].count;
      //         object.color = cart[i].color;
      //         let getPrice = await Product.findById(cart[i]._id).select("price").exec();
      //         object.price = getPrice.price;
      //         products.push(object);
      //       }
      
      //       let cartTotal = calculateTotal(products);
      
      //       let newCart = await new Cart({
      //         products,
      //         cartTotal,
      //         orderby: user?._id,
      //       }).save();
      //       res.json(newCart);
      //     }
      //   } catch (error) {
      //     throw new Error(error);
      //   }
      // });
      
      // // Helper function to calculate the total price of an array of products
      // const calculateTotal = (products) => {
      //   return products.reduce((total, product) => total + product.price * product.count, 0);
      // };
      
      const userCart = asyncHandler(async (req, res) => {
        const { productId,color,quantity,price } = req.body;
        const { _id } = req.user;
        validateMongoDbId(_id);
      
        try {
          // let products = [];
          // const user = await User.findById(_id);
      
          // // Check if user already has products in the cart
          // const alreadyExistCart = await Cart.findOne({ orderby: user._id });
      
          // if (alreadyExistCart) {
          //   // If the cart already exists, update its content
          //   alreadyExistCart.products = [];
          //   alreadyExistCart.cartTotal = 0;
          //   await alreadyExistCart.save();
          // }
      
          // for (let i = 0; i < cart.length; i++) {
          //   let object = {};
          //   object.product = cart[i]._id;
          //   object.count = cart[i].count;
          //   object.color = cart[i].color;
          //   let getPrice = await Product.findById(cart[i]._id).select("price").exec();
          //   object.price = getPrice.price;
          //   products.push(object);
          // }
      
          // let cartTotal = 0;
          // for (let i = 0; i < products.length; i++) {
          //   cartTotal = cartTotal + products[i].price * products[i].count;
          // }
      
          // // Create or update the user's cart
          // if (alreadyExistCart) {
          //   alreadyExistCart.products = products;
          //   alreadyExistCart.cartTotal = cartTotal;
          //   await alreadyExistCart.save();
          //   res.json(alreadyExistCart);
          // } else {
            let newCart = await new Cart({
              userId:_id,
              productId,
              color,
              price,
              quantity
              
            }).save();
            res.json(newCart);
          
        } catch (error) {
          throw new Error(error);
        }
      });
      
      const getUserCart = asyncHandler(async (req, res) => {
        const { _id } = req.user;
        validateMongoDbId(_id);
      
        try {
          const cart = await Cart.find({ userId: _id }).populate("productId");
          res.json(cart);
        } catch (error) {
          throw new Error(error);
        }
      });
      const removeProductFromCart = asyncHandler(async (req, res) => {
        const { _id } = req.user;
        const {cartItemId}=req.params
        validateMongoDbId(_id);
      
        try {
          const deleteProductFromcart = await Cart.deleteOne({userId:_id,_id:cartItemId})
          res.json(deleteProductFromcart);
        } catch (error) {
          throw new Error(error);
        }
      });
      const updateProductQuantityFromCart = asyncHandler(async (req, res) => {
        const { _id } = req.user;
        const {cartItemId,newQuantity}=req.params
        validateMongoDbId(_id);
      
        try {
          const cartItem = await Cart.findOne({userId:_id,_id:cartItemId})
          cartItem.quantity=newQuantity
          cartItem.save()
          res.json(cartItem);
        } catch (error) {
          throw new Error(error);
        }
      });
      
      const createOrder=asyncHandler(async(req,res)=>{
        const{shippingInfo,orderItems,totalPrice,totalPriceAfterDiscount}=req.body;
        const{_id}=req.user;
        try{
            const order=await Order.create({
              shippingInfo,orderItems,totalPrice,totalPriceAfterDiscount,user:_id
            })
            res.json({
              order,
              success:true
            })
        }
        catch(error){
          throw new Error(error)
        }
      })
      
      // const emptyCart = asyncHandler(async (req, res) => {
      //   const { _id } = req.user;
      //   validateMongoDbId(_id);
      //   try {
      //     const user = await User.findOne({ _id });
      //     const cart = await Cart.findOneAndRemove({ orderby: user._id });
      //     res.json(cart);
      //   } catch (error) {
      //     throw new Error(error);
      //   }
      // });
      
      // const applyCoupon = asyncHandler(async (req, res) => {
      //   const { coupon } = req.body;
      //   const { _id } = req.user;
      //   validateMongoDbId(_id);
      //   const validCoupon = await Coupon.findOne({ name: coupon });
      //   if (validCoupon === null) {
      //     throw new Error("Invalid Coupon");
      //   }
      //   const user = await User.findOne({ _id });
      //   let { cartTotal } = await Cart.findOne({
      //     orderby: user._id,
      //   }).populate("products.product");
      //   let totalAfterDiscount = (
      //     cartTotal -
      //     (cartTotal * validCoupon.discount) / 100
      //   ).toFixed(2);
      //   await Cart.findOneAndUpdate(
      //     { orderby: user._id },
      //     { totalAfterDiscount },
      //     { new: true }
      //   );
      //   res.json(totalAfterDiscount);
      // });
      // const createOrder = asyncHandler(async (req, res) => {
      //   const { COD, couponApplied } = req.body;
      //   const { _id } = req.user;
      //   validateMongoDbId(_id);
      //   try {
      //     if (!COD) throw new Error("Create cash order failed");
      //     const user = await User.findById(_id);
      //     let userCart = await Cart.findOne({ orderby: user._id });
      //     let finalAmout = 0;
      //     if (couponApplied && userCart.totalAfterDiscount) {
      //       finalAmout = userCart.totalAfterDiscount;
      //     } else {
      //       finalAmout = userCart.cartTotal;
      //     }
      
      //     let newOrder = await new Order({
      //       products: userCart.products,
      //       paymentIntent: {
      //         id: uniqid(),
      //         method: "COD",
      //         amount: finalAmout,
      //         status: "Cash on Delivery",
      //         created: Date.now(),
      //         currency: "usd",
      //       },
      //       orderby: user._id,
      //       orderStatus: "Cash on Delivery",
      //     }).save();
      //     let update = userCart.products.map((item) => {
      //       return {
      //         updateOne: {
      //           filter: { _id: item.product._id },
      //           update: { $inc: { quantity: -item.count, sold: +item.count } },
      //         },
      //       };
      //     });
      //     const updated = await Product.bulkWrite(update, {});
      //     res.json({ message: "success" });
      //   } catch (error) {
      //     throw new Error(error);
      //   }
      // });
      
      // const getOrders = asyncHandler(async (req, res) => {
      //   const { _id } = req.user;
      //   validateMongoDbId(_id);
      //   try {
      //     const userorders = await Order.findOne({ orderby: _id })
      //       .populate("products.product")
      //       .populate("orderby")
      //       .exec();
      //     res.json(userorders);
      //   } catch (error) {
      //     throw new Error(error);
      //   }
      // });
      
      // const getAllOrders = asyncHandler(async (req, res) => {
      //   try {
      //     const alluserorders = await Order.find()
      //       .populate("products.product")
      //       .populate("orderby")
      //       .exec();
      //     res.json(alluserorders);
      //   } catch (error) {
      //     throw new Error(error);
      //   }
      // });
      
      // const getOrderByUserId = asyncHandler(async (req, res) => {
      //   const { id } = req.params;
      //   validateMongoDbId(id);
      //   try {
      //     const userorders = await Order.findOne({ orderby: id })
      //       .populate("products.product")
      //       .populate("orderby")
      //       .exec();
      //     res.json(userorders);
      //   } catch (error) {
      //     throw new Error(error);
      //   }
      // });
      // const updateOrderStatus = asyncHandler(async (req, res) => {
      //   const { status } = req.body;
      //   const { id } = req.params;
      //   validateMongoDbId(id);
      //   try {
      //     const updateOrderStatus = await Order.findByIdAndUpdate(
      //       id,
      //       {
      //         orderStatus: status,
      //         paymentIntent: {
      //           status: status,
      //         },
      //       },
      //       { new: true }
      //     );
      //     res.json(updateOrderStatus);
      //   } catch (error) {
      //     throw new Error(error);
      //   }
      // });
  module.exports={createUser,loginUserCtrl ,getallUser,
    getaUser,updateProductQuantityFromCart,
    deleteaUser,removeProductFromCart,createOrder,
    updatedUser,blockUser,unblockUser,handleRefreshToken,logout,updatePassword,forgotPasswordToken,resetPassword,loginAdmin,getWishlist,saveAddress,userCart,getUserCart,
   // emptyCart,applyCoupon,createOrder,getOrders,getAllOrders,updateOrderStatus,getOrderByUserId
  };
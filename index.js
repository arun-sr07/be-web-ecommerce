const express = require("express");
const dbConnect = require("./config/dbConnect");
const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 4000;
const authRouter=require("./routes/authRoute");
const bodyParser = require("body-parser");
const productRouter=require("./routes/productRoute");
const categoryRouter = require("./routes/prodcategoryRoute");
const blogRouter=require("./routes/blogRoute");
const colorRouter=require("./routes/colorRoute");
const enqRouter = require("./routes/enqRoute");
const brandRouter = require("./routes/brandRoute");
const uploadRouter = require("./routes/uploadRoute");
const couponRouter = require("./routes/couponRoute");
const blogcategoryRouter = require("./routes/blogCatRoute");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const cookieParser = require("cookie-parser");
const morgan=require("morgan");
const cors=require("cors")

dbConnect();
app.use(morgan('dev'));
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use('/api/user',authRouter)
app.use('/api/product',productRouter)
app.use("/api/blog",blogRouter)
app.use("/api/brand", brandRouter);
app.use("/api/enquiry", enqRouter);
app.use("/api/category", categoryRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/color", colorRouter);
app.use("/api/blogcategory", blogcategoryRouter);
app.use("/api/upload", uploadRouter);
app.use(cookieParser())
app.use(notFound)
app.use(errorHandler)
app.listen (PORT, () => {
console.log(`Server is running at PORT ${PORT}`);
});
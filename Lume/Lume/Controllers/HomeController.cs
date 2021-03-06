﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ORM;
using System.Data.Entity;
using Lume.Models;
using System.IO;
using System.Web.Hosting;

namespace Lume.Controllers
{
    public class HomeController : Controller
    {
        //
        // GET: /Index/

        private DbContext context = new LumeDBEntities();

        public ActionResult Index()
        {
            return View();
        }
        public JsonResult GetAllImages()
        {
            AlbumModel[] albums = context.Set<Album>()
                                                        .Select(alb => new AlbumModel()
                                                        {
                                                            AlbumId = alb.Id,
                                                            Name = alb.Name,
                                                            id_User = alb.id_User,
                                                            Images = alb.Images.
                                                                                Select(im => new ImageModel()
                                                                                {
                                                                                    ImageId = im.Id,
                                                                                    AlbumId = im.id_Albums,
                                                                                    Description = im.Description,
                                                                                    Extension = new ExtensionModel()
                                                                                    {
                                                                                        Id = im.id_Extension,
                                                                                        Name = im.Extension.Name
                                                                                    },
                                                                                    Url = im.Url,
                                                                                    Cost = im.Image_cost
                                                                                }).ToList()
                                                        })
                                                        .ToArray();
            return Json(albums, JsonRequestBehavior.AllowGet);
        }

        public JsonResult AddImage(ImageModel img)
        {
            context.Set<Image>().Add(new Image() { id_Albums = img.AlbumId, Description = img.Description, Url = img.Url, Image_cost = img.Cost });
            context.SaveChanges();
            return null;
        }

        public JsonResult UploadImage()
        {
            var file = HttpContext.Request.Files[0];
            string filetype = new String(file.ContentType.Skip(file.ContentType.IndexOf('/')+1).ToArray());
            if (context.Set<Extension>().FirstOrDefault(ex => ex.Name == filetype) == null)
                context.Set<Extension>().Add(new Extension() { Name = filetype });
            var album = int.Parse(HttpContext.Request.Form.Get("album"));
            var name = HttpContext.Request.Form.Get("name");
            double? cost = null;
            cost = HttpContext.Request.Form.Get("cost") != null ? Convert.ToDouble(HttpContext.Request.Form.Get("cost")):cost;
            var currentExt = context.Set<Extension>().FirstOrDefault(ex => ex.Name == filetype);
            context.Set<Image>().Add(new Image() { id_Albums = album, Description = name, id_Extension = currentExt.Id,Image_cost = cost });
            context.SaveChanges();
            var currentImage = context.Set<Image>().Where(im => im.Description == name).ToList().Last();
            int id = currentImage.Id;
            currentImage.Url = $@"http://{HttpContext.Request.Url.Authority}\Images\{id}.{filetype}";
            file.SaveAs($@"{HostingEnvironment.ApplicationPhysicalPath}\Images\{id}.{filetype}");
            //context.Set<Image>().Last(im => im.Description == name).Id
            context.SaveChanges();
            return null;
        }

        public JsonResult RemoveImage(int imageId)
        {
            Image currentImage = context.Set<Image>().First(img => img.Id == imageId);
            if (System.IO.File.Exists($@"{HostingEnvironment.ApplicationPhysicalPath}\Images\{imageId}.{currentImage.Extension.Name}"))
                System.IO.File.Delete($@"{HostingEnvironment.ApplicationPhysicalPath}\Images\{imageId}.{currentImage.Extension.Name}");
            context.Set<Image>().Remove(currentImage);
            context.SaveChanges();
            return null;
        }

        public JsonResult Login(string email, string password)
        {
            var currentUser = context.Set<User>().FirstOrDefault(u => u.User_Email == email && u.User_Password == password);
            if (currentUser == null)
                return Json(new { error = "Incorect email or password" });
            List<ImageModel> imagesInCart = new List<ImageModel>();
            foreach(Image im in context.Set<Cart>().Where(c => c.id_User == currentUser.Id).Select(c => c.Image))
            {
                imagesInCart.Add(new ImageModel()
                {
                    ImageId = im.Id,
                    AlbumId = im.id_Albums,
                    Description = im.Description,
                    Extension = new ExtensionModel()
                    {
                        Id = im.id_Extension,
                        Name = im.Extension.Name
                    },
                    Url = im.Url,
                    Cost = im.Image_cost
                });
            }
            return Json(new
            {
                success = "Login successful",
                user = new UserModel()
                {
                    Id = currentUser.Id,
                    Email = currentUser.User_Email,
                    Role = (UserRole)currentUser.id_Role
                },
                cart = new CartModel()
                {
                    id_User = currentUser.Id,
                    Images = imagesInCart
                }
            });
        }

        public JsonResult Register(string email, string password)
        {
            if (context.Set<User>().FirstOrDefault(u => u.User_Email == email) != null)
                return Json(new { error = "A user with this email address already exists" });
            context.Set<User>().Add(new User() { User_Email = email, User_Password = password });
            context.SaveChanges();
            return Json(new { success = "Account created" });
        }

        public JsonResult GetDesc()
        {
            string desc = System.IO.File.ReadAllText($@"{HostingEnvironment.ApplicationPhysicalPath }\Content\Site_Desc.txt");
            return Json(new { description = desc },JsonRequestBehavior.AllowGet);
        }

        public JsonResult SetDesc(string desc)
        {
            System.IO.File.WriteAllText($@"{HostingEnvironment.ApplicationPhysicalPath }\Content\Site_Desc.txt", desc);
            return null;
        }

        public JsonResult AddToCart(int id_User, int Image_Id)
        {
            context.Set<Cart>().Add(new Cart() { id_Image = Image_Id, id_User = id_User });
            context.SaveChanges();
            return null;
        }
        public JsonResult ClearCart(int id_User)
        {
            foreach(Cart cartToRemove in context.Set<Cart>().Where(c => c.id_User==id_User))
            {
                context.Set<Cart>().Remove(cartToRemove);
            }
            context.SaveChanges();
            return null;
        }
    }
}

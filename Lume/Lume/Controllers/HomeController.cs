using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ORM;
using System.Data.Entity;
using Lume.Models;

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
        [HttpGet]
        public JsonResult GetAllImages()
        {
            AlbumModel[] albums = context.Set<Album>()
                                                        .Select(alb => new AlbumModel()
                                                        {
                                                            AlbumId = alb.Id,
                                                            Name = alb.Name,
                                                            Images = alb.Images.
                                                                                Select(im => new ImageModel()
                                                                                {
                                                                                    ImageId = im.Id,
                                                                                    AlbumId = im.id_Albums,
                                                                                    Description = im.Description,
                                                                                    Url = im.Url
                                                                                }).ToList()
                                                        })
                                                        .ToArray();
            return Json(albums, JsonRequestBehavior.AllowGet);
        }

        public JsonResult AddImage(ImageModel img)
        {
            context.Set<Image>().Add(new Image() { id_Albums = img.AlbumId, Description = img.Description, Url = img.Url });
            context.SaveChanges();
            return null;
        }

        public JsonResult RemoveImage(int imageId)
        {
            Image currentImage = context.Set<Image>().First(img => img.Id == imageId);
            context.Set<Image>().Remove(currentImage);
            context.SaveChanges();
            return null;
        }
    }
}

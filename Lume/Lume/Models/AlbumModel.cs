using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using ORM;

namespace Lume.Models
{
    public class AlbumModel
    {
        public int AlbumId { get; set; }
        public string Name { get; set; }
        public List<ImageModel> Images { get; set; }
    }
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Lume.Models
{
    public class ImageModel
    {
        public int ImageId { get; set; }
        public int AlbumId { get; set; }
        public string Description { get; set; }
        public string Url { get; set; }
        public ExtensionModel Extension { get; set; }
        public double? Cost { get; set; }
    }
}
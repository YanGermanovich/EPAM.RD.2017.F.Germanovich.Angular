using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Lume.Models
{
    public class CartModel
    {
        public int Id { get; set; }
        public List<ImageModel> Images { get; set;}
        public int id_User { get; set; }
    }
}
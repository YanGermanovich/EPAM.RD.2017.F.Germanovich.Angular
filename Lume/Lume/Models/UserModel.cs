using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Lume.Models
{

    public enum UserRole
    {
        User,
        Admin
    }

    public class UserModel
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public UserRole Role { get; set; }
    }
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Muse.Models
{
    public class RMuseAccount
    {
        public RMuseAccount()
        {
            museEntity = new MuseDBEntities();
        }
        public MuseDBEntities museEntity { get; set; }
        public User_tb GetUser(int userID)
        {
            User_tb user = new User_tb();
            user = museEntity.User_tb.Where(u => u.UserID == userID).FirstOrDefault();
            return user;
        }
        public User_tb GetUser(string userAccount)
        {
            User_tb user = museEntity.User_tb.Where(u=>u.UserAccount==userAccount).FirstOrDefault();
            return user;
        }
    }
}
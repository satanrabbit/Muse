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
        /// <summary>
        /// 获取指定ID 的用户
        /// </summary>
        /// <param name="userID">用户ID</param>
        /// <returns>用户实体</returns>
        public User_tb GetUser(int userID)
        {
            User_tb user = new User_tb();
            user = museEntity.User_tb.Where(u => u.UserID == userID).FirstOrDefault();
            return user;
        }
        /// <summary>
        /// 获取指定账号的用户
        /// </summary>
        /// <param name="userAccount">用户账号</param>
        /// <returns>用户实体</returns>
        public User_tb GetUser(string userAccount)
        {
            User_tb user = museEntity.User_tb.Where(u=>u.UserAccount==userAccount).FirstOrDefault();
            return user;
        }
        /// <summary>
        /// 获取指定ID的管理员
        /// </summary>
        /// <param name="adminID"></param>
        /// <returns></returns>
        public Admin_tb GetAdmin(int adminID)
        {
            return museEntity.Admin_tb.Where(a => a.AdminID == adminID).FirstOrDefault();
        }
        /// <summary>
        /// 获取指定账号的管理员
        /// </summary>
        /// <param name="adminAccount"></param>
        /// <returns></returns>
        public Admin_tb GetAdmin(string adminAccount)
        {
            return museEntity.Admin_tb.Where(a => a.AdminAccount == adminAccount).FirstOrDefault();
        }
         

    }
}
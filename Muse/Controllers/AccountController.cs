using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Muse.Models;
using System.Web.Security;

namespace Muse.Controllers
{
    public class AccountController : Controller
    {
        //
        // GET: /Account/

        public ActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public ActionResult Login(string UserAccount,String UserPWD)
        {
            ViewBag.UserAccount = UserAccount;
            ViewBag.UserPWD = UserPWD;
            RMuseAccount rmuseAccount = new RMuseAccount();
            User_tb user_tb = rmuseAccount.GetUser(UserAccount);
            if (user_tb == null)
            {
                ViewBag.errorMsg = "账号不存在";
            }
            else
            {
                if (user_tb.UserPWD != UserPWD)
                {
                    ViewBag.errorMsg = "密码错误";
                }
                else
                {
                    //设置Cookies，指定权限,返回至登陆前页面
                    FormsAuthenticationTicket authTicket = new FormsAuthenticationTicket(
                        1,
                        user_tb.UserID.ToString(),
                        DateTime.Now,
                        DateTime.Now.AddHours(10000),
                        false,
                       "MuseUser"
                        );
                    string encTicket = FormsAuthentication.Encrypt(authTicket);
                    this.Response.Cookies.Add(new HttpCookie(FormsAuthentication.FormsCookieName, encTicket));
                    string url = Request["ReturnUrl"];
                    if (url == null)
                    {
                        return RedirectToAction("Index","Home");
                    }
                    else
                    {
                        return Redirect(url);
                    }
                }
            }
            return View();
        }

    }
}

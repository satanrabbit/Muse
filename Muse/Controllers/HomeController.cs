using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;

namespace Muse.Controllers
{
    public class HomeController : Controller
    {
        //
        // GET: /Home/
        [ValidateInput(false)]
        public ActionResult Index()
        {
            //FormsAuthenticationTicket
            if (User.Identity.IsAuthenticated)
            {
                int userID = Convert.ToInt32(User.Identity.Name);
                var monitor = 3;
                if (monitor != null)
                {
                    if (userID == 3)
                    {
                        //设置Cookies，指定权限,返回至登陆前页面
                        FormsAuthenticationTicket authTicket = new FormsAuthenticationTicket(
                            1,
                            userID.ToString(),
                            DateTime.Now,
                            DateTime.Now.AddHours(10000),
                            false,
                           "monitor,student"
                            );
                        string encTicket = FormsAuthentication.Encrypt(authTicket);
                        this.Response.Cookies.Add(new HttpCookie(FormsAuthentication.FormsCookieName, encTicket));
                        string url = Request["ReturnUrl"];
                        if (url == null)
                        {
                            return RedirectToAction("Index", "MClass");
                        }
                        else
                        {
                            return Redirect(url);
                        }
                    }
                }
            }
            return View();
        }
        [Authorize]
        public ActionResult Guide()
        {
            return View();
        }

    }
}

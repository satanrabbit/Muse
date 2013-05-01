using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using Muse.Models;

namespace Muse.Controllers
{
    public class HomeController : Controller
    {
        //
        // GET: /Home/
        [ValidateInput(false)]
        [JsonAuthorizeFilter(Roles = "MuseUser,MuseAdmin")]
        public ActionResult Index()
        {
            return View();
        }
        [JsonAuthorizeFilter(Roles="MuseUser,MuseAdmin")]
        public ActionResult Guide()
        {
            return View();
        }

    }
}

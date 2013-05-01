using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Principal;
using System.Web;
using System.Web.Mvc;

namespace Muse.Models
{
    public class JsonAuthorizeFilter : AuthorizeAttribute
    {
        protected override  void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
            // Returns HTTP 401 - see comment in HttpUnauthorizedResult.cs.
            var json = new JsonResult();
            json.Data = new { status = 0, msg = "您没有登录" };
            json.ContentEncoding = System.Text.UTF8Encoding.UTF8;
            json.JsonRequestBehavior = JsonRequestBehavior.AllowGet;
            filterContext.Result = json;
        }
    }
}
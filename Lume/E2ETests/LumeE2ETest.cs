using System;
using NUnit.Framework;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;

namespace E2ETests
{
    [TestFixture]
    public class LumeE2ETest
    {
        [Test]
        public void JsTest()
        {
            IWebDriver driver = new ChromeDriver();
            driver.Navigate().GoToUrl("http://localhost:2079");

            driver.FindElement(By.Id("editsave_btn")).Click();
            driver.FindElement(By.Id("description_edit")).SendKeys("123");
            driver.FindElement(By.Id("editsave_btn")).Click();
            driver.FindElement(By.Id("editsave_btn")).Click();
            driver.FindElement(By.Id("description_edit")).SendKeys("123456");
            driver.FindElement(By.Id("cancel_btn")).Click();
            driver.FindElement(By.LinkText("View All")).Click();
            driver.Manage().Timeouts().ImplicitlyWait(TimeSpan.FromSeconds(3));
            int count = driver.FindElements(By.ClassName("view_image")).Count;
            var education = driver.FindElement(By.TagName("select"));
            var selectElement = new SelectElement(education);
            selectElement.SelectByIndex(1);
            driver.FindElement(By.LinkText("Add")).Click();
            driver.FindElement(By.Id("tmp_src")).SendKeys("Fox");
            driver.FindElement(By.Id("tmp_desc")).SendKeys("http://kingofwallpapers.com/picture/picture-015.jpg");
            driver.FindElement(By.Id("add_btn")).Click();
            if ( !driver.FindElement(By.Id("tmp_src")).GetAttribute("value").Equals(String.Empty) ||
                 !driver.FindElement(By.Id("tmp_desc")).GetAttribute("value").Equals(String.Empty))
                Assert.Fail();
            driver.Manage().Timeouts().ImplicitlyWait(TimeSpan.FromSeconds(3));
            driver.FindElement(By.LinkText("View All")).Click();
            var images = driver.FindElements(By.ClassName("view_image"));
            Assert.IsTrue((count + 1) == images.Count);
            bool flag = false;
            foreach (var im in images)
            {
                if (im.FindElement(By.ClassName("image_src")).GetAttribute("src").Equals("http://kingofwallpapers.com/picture/picture-015.jpg"))
                {
                    im.FindElement(By.ClassName("del_btn")).Click();
                    flag = true;
                }
            }
            Assert.IsTrue(flag);
        }
    }
}


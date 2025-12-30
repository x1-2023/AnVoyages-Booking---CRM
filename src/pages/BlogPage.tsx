import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Calendar, User, ArrowRight, Search } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import destinationBali from "@/assets/destination-bali.jpg";
import destinationTokyo from "@/assets/destination-tokyo.jpg";
import destinationSantorini from "@/assets/destination-santorini.jpg";
import destinationHalong from "@/assets/destination-halong.jpg";

const BlogPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const blogPosts = [
    {
      id: 1,
      title: t("blog.post1_title"),
      excerpt: t("blog.post1_excerpt"),
      image: destinationBali,
      category: t("blog.category_tips"),
      author: "Sarah Johnson",
      date: "2024-12-15",
      readTime: "5 min",
    },
    {
      id: 2,
      title: t("blog.post2_title"),
      excerpt: t("blog.post2_excerpt"),
      image: destinationTokyo,
      category: t("blog.category_guides"),
      author: "Mike Chen",
      date: "2024-12-10",
      readTime: "8 min",
    },
    {
      id: 3,
      title: t("blog.post3_title"),
      excerpt: t("blog.post3_excerpt"),
      image: destinationSantorini,
      category: t("blog.category_destinations"),
      author: "Emma Wilson",
      date: "2024-12-05",
      readTime: "6 min",
    },
    {
      id: 4,
      title: t("blog.post4_title"),
      excerpt: t("blog.post4_excerpt"),
      image: destinationHalong,
      category: t("blog.category_culture"),
      author: "David Nguyen",
      date: "2024-11-28",
      readTime: "7 min",
    },
  ];

  const categories = [
    { name: t("blog.category_all"), count: 24 },
    { name: t("blog.category_tips"), count: 8 },
    { name: t("blog.category_guides"), count: 6 },
    { name: t("blog.category_destinations"), count: 5 },
    { name: t("blog.category_culture"), count: 5 },
  ];

  const filteredPosts = blogPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              {t("blog.title")}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              {t("blog.subtitle")}
            </p>
            
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("blog.search_placeholder")}
                className="pl-12 h-12 rounded-full"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-1 space-y-8"
            >
              {/* Categories */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="text-lg font-display font-bold text-foreground mb-4">
                  {t("blog.categories")}
                </h3>
                <ul className="space-y-3">
                  {categories.map((category, index) => (
                    <li key={index}>
                      <button className="flex items-center justify-between w-full text-left text-muted-foreground hover:text-primary transition-colors">
                        <span>{category.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {category.count}
                        </Badge>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Popular Tags */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="text-lg font-display font-bold text-foreground mb-4">
                  {t("blog.popular_tags")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["Travel", "Beach", "Adventure", "Food", "Culture", "Tips"].map(
                    (tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {tag}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            </motion.aside>

            {/* Blog Posts Grid */}
            <div className="lg:col-span-3">
              <div className="grid md:grid-cols-2 gap-6">
                {filteredPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <Badge className="absolute top-4 left-4">
                        {post.category}
                      </Badge>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(post.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {post.author}
                        </span>
                      </div>
                      <h2 className="text-xl font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <Button variant="ghost" className="group/btn p-0 h-auto">
                        {t("blog.read_more")}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </motion.article>
                ))}
              </div>

              {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{t("blog.no_results")}</p>
                </div>
              )}

              {/* Load More */}
              <div className="text-center mt-12">
                <Button variant="outline" size="lg">
                  {t("blog.load_more")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogPage;

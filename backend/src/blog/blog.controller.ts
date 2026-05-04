import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BlogService } from './blog.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

@ApiTags('Blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @ApiOperation({ summary: 'Get published blog posts' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'category', required: false })
  findPublished(@Query('q') q?: string, @Query('category') category?: string, @Query('lang') lang?: string) {
    return this.blogService.findAll({ q, category, lang, publicOnly: true });
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get published blog categories' })
  getCategories(@Query('lang') lang?: string) {
    return this.blogService.getCategories(lang);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get published blog post by slug' })
  findBySlug(@Param('slug') slug: string, @Query('lang') lang?: string) {
    return this.blogService.findPublishedBySlug(slug, lang);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all blog posts for admin' })
  findAllAdmin(@Query('status') status?: string, @Query('q') q?: string) {
    return this.blogService.findAll({ status, q });
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get blog post by id for admin' })
  findOneAdmin(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create blog post' })
  create(@Body() dto: CreateBlogPostDto) {
    return this.blogService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update blog post' })
  update(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
    return this.blogService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete blog post' })
  remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }
}

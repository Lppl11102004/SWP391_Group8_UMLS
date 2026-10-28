package com.ulms.book.service;

import com.ulms.book.dto.AuthorDetailResponse;
import com.ulms.book.dto.AuthorResponse;
import com.ulms.book.dto.BookListResponse;
import com.ulms.book.entity.Author;
import com.ulms.book.entity.Book;
import com.ulms.book.repository.AuthorRepository;
import com.ulms.book.repository.BookRepository;
import com.ulms.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.checkerframework.checker.units.qual.A;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthorServiceImpl implements AuthorService{

    private final AuthorRepository authorRepository;
    private final BookRepository bookRepository;

    @Override
    public List<AuthorResponse> getListAuthor(Integer page, Integer size) {
        Page<Author> request = searchPageableAuthor(page, size);
        List<AuthorResponse> list = standardListAuthor(request);
        return list;
    }

    public Page<Author> searchPageableAuthor(Integer page, Integer size){
        Pageable pageable = PageRequest.of(
                page,
                size
        );

        Page<Author> reviews = authorRepository.getAllAuthors(
                pageable
        );
        return reviews;
    }

    public List<AuthorResponse> standardListAuthor(Page<Author> request){
        List<AuthorResponse> list = new ArrayList<>();

        for (Author a : request.getContent()) {

            AuthorResponse response = new AuthorResponse();
            response.setAuthorId(a.getAuthorId());
            response.setName(a.getName());
            response.setBio(a.getBio());
            response.setAuthorAvatarUrl(a.getAvatarUrl());
            response.setAvatarUrl(a.getAvatarUrl());
            list.add(response);
        }
        return list;
    }


    @Override
    public AuthorDetailResponse getAuthorDetail(Integer authorId) {

        Author author = authorRepository.findById(authorId).orElse(null);
        if (author == null){
            throw new ApiException("Thông tin tác giả không khả dụng");
        }

        List<Book> books = bookRepository.findByAuthor_AuthorId(authorId);

        AuthorDetailResponse authorDetail = new AuthorDetailResponse();
        authorDetail.setAuthorId(authorId);
        authorDetail.setName(author.getName());
        authorDetail.setBio(author.getBio());
        authorDetail.setAuthorAvatarUrl(author.getAvatarUrl());
        authorDetail.setAvatarUrl(author.getAvatarUrl());

        List<BookListResponse>  listRelateBook = new ArrayList<>();

        if (!books.isEmpty()){
            for(Book book : books){
                BookListResponse b = new BookListResponse();
                b.setBookId(book.getBookId());
                b.setTitle(book.getTitle());
                b.setPrice(book.getPrice());
                b.setCoverImageUrl(book.getCoverImageUrl());
                b.setDescription(book.getDescription());
                b.setCategoryName(book.getCategory().getName());
                b.setPublisherName(book.getPublisher().getName());

                listRelateBook.add(b);
            }
        }

        authorDetail.setListRelateBook(listRelateBook);

        return authorDetail;
    }
}

package com.ulms.book.service;

import com.ulms.book.dto.PublisherResponse;
import com.ulms.book.entity.Publisher;
import com.ulms.book.repository.PublisherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PublisherServiceImpl implements PublisherService{

    private final PublisherRepository publisherRepository;

    @Override
    public List<PublisherResponse> viewAllPublisher() {
        List<Publisher> publishers = publisherRepository.findAll();
        List<PublisherResponse> publisherResponses = new ArrayList<>();
        for(Publisher p : publishers){
            PublisherResponse publisherResponse = new PublisherResponse();
            publisherResponse.setPublisherId(p.getPublisherId());
            publisherResponse.setName(p.getName());
            publisherResponse.setAddress(p.getAddress());

            publisherResponses.add(publisherResponse);
        }
        return publisherResponses;
    }
}

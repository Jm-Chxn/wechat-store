package com.tuangou.activity.web;

import com.tuangou.activity.dto.ActivityDto;
import com.tuangou.activity.dto.TrackEventRequest;
import com.tuangou.activity.service.ActivityService;
import com.tuangou.common.auth.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/events")
public class EventsController {
  private final ActivityService activityService;

  public EventsController(ActivityService activityService) {
    this.activityService = activityService;
  }

  @PostMapping("/track")
  public ActivityDto track(@Valid @RequestBody TrackEventRequest req) {
    return activityService.track(AuthenticatedUser.currentUserIdOrNull(), req);
  }
}

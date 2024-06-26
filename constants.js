const fbAccountRequest =
  "/insights?metric=" +
  "page_content_activity_by_action_type_unique" + // all 3
  ",page_content_activity_by_age_gender_unique" + // none
  ",page_content_activity_by_city_unique" + // none
  ",page_content_activity_by_country_unique" + // none
  ",page_content_activity_by_locale_unique" + // none
  ",page_content_activity" + // all 3
  ",page_impressions" + // all 3
  ",page_impressions_unique" + // all 3
  ",page_impressions_paid" + // all 3
  ",page_impressions_paid_unique" + // all 3
  ",page_impressions_organic" + // all 3
  ",page_impressions_organic_unique" + // all 3
  ",page_impressions_viral" + // all 3
  ",page_impressions_viral_unique" + // all 3
  ",page_impressions_nonviral" + // all 3
  ",page_impressions_nonviral_unique" + // all 3
  ",page_impressions_by_city_unique" + // none
  ",page_impressions_by_country_unique" + // none
  ",page_impressions_by_locale_unique" + // none
  ",page_impressions_by_age_gender_unique" + // none
  ",page_engaged_users" + // all 3
  ",page_post_engagements" + // all 3
  ",page_consumptions" + // all 3
  ",page_consumptions_unique" + // all 3
  ",page_consumptions_by_consumption_type" + // all 3
  ",page_consumptions_by_consumption_type_unique" + // all 3
  ",page_places_checkins_by_age_gender" + // none
  ",page_places_checkin_total_unique" + // all 3
  ",page_places_checkin_mobile" + // all 3
  ",page_places_checkin_mobile_unique" + // all 3
  ",page_places_checkins_by_age_gender" + // none
  ",page_places_checkins_by_locale" + // none
  ",page_places_checkins_by_country" + // none
  ",page_negative_feedback" + // all 3
  ",page_negative_feedback_unique" + // all 3
  ",page_negative_feedback_by_type" + // all 3
  ",page_negative_feedback_by_type_unique" + // all 3
  ",page_positive_feedback_by_type" + // all 3
  ",page_positive_feedback_by_type_unique" + // all 3
  ",page_fans_online" + // day
  ",page_fans_online_per_day" + // none
  ",page_fan_adds_by_paid_non_paid_unique" + // day
  ",page_actions_post_reactions_like_total" + // all 3
  ",page_actions_post_reactions_love_total" + // all 3
  ",page_actions_post_reactions_wow_total" + // all 3
  ",page_actions_post_reactions_haha_total" + // all 3
  ",page_actions_post_reactions_sorry_total" + // all 3
  ",page_actions_post_reactions_anger_total" + // all 3
  ",page_actions_post_reactions_total" + // day
  ",page_total_actions" + // all 3
  ",page_cta_clicks_logged_in_total" + // all 3
  ",page_cta_clicks_logged_in_unique" + // all 3
  ",page_cta_clicks_by_site_logged_in_unique" + // all 3
  ",page_cta_clicks_by_age_gender_logged_in_unique" + // none
  ",page_cta_clicks_logged_in_by_country_unique" + // none
  ",page_cta_clicks_logged_in_by_city_unique" + // none
  ",page_call_phone_clicks_logged_in_unique" + // all 3
  ",page_call_phone_clicks_by_age_gender_logged_in_unique" + // none
  ",page_call_phone_clicks_logged_in_by_country_unique" + // none
  ",page_call_phone_clicks_logged_in_by_city_unique" + // none
  ",page_call_phone_clicks_by_site_logged_in_unique" + // all 3
  ",page_get_directions_clicks_logged_in_unique" + // all 3
  ",page_get_directions_clicks_by_age_gender_logged_in_unique" + // none
  ",page_get_directions_clicks_logged_in_by_country_unique" + // none
  ",page_get_directions_clicks_logged_in_by_city_unique" + // none
  ",page_get_directions_clicks_by_site_logged_in_unique" + // all 3
  ",page_website_clicks_logged_in_unique" + // all 3
  ",page_website_clicks_by_age_gender_logged_in_unique" + // none
  ",page_website_clicks_logged_in_by_country_unique" + // none
  ",page_website_clicks_logged_in_by_city_unique" + // none
  ",page_website_clicks_by_site_logged_in_unique" + // all 3
  ",page_fans" + // lifetime
  ",page_fans_locale" + // none
  ",page_fans_city" + // none
  ",page_fans_country" + // none
  ",page_fans_gender_age" + // none
  ",page_fan_adds" + // day
  ",page_fan_adds_unique" + // all 3
  ",page_fans_by_like_source" + // day
  ",page_fans_by_like_source_unique" + // day
  ",page_fan_removes" + // day
  ",page_fan_removes_unique" + // all 3
  ",page_fans_by_unlike_source_unique" + // day
  ",page_views_total" + // all 3
  ",page_views_logout" + // none
  ",page_views_logged_in_total" + // all 3
  ",page_views_logged_in_unique" + // all 3
  ",page_views_external_referrals" + // day
  ",page_views_by_profile_tab_total" + // all 3
  ",page_views_by_profile_tab_logged_in_unique" + // all 3
  ",page_views_by_internal_referer_logged_in_unique" + // all 3
  ",page_views_by_site_logged_in_unique" + // all 3
  ",page_views_by_age_gender_logged_in_unique" + // none
  ",page_video_views" + // all 3
  ",page_video_views_paid" + // all 3
  ",page_video_views_organic" + // all 3
  ",page_video_views_by_paid_non_paid" + // all 3
  ",page_video_views_autoplayed" + // all 3
  ",page_video_views_click_to_play" + // all 3
  ",page_video_views_unique" + // all 3
  ",page_video_repeat_views" + // all 3
  ",page_video_complete_views_30s" + // all 3
  ",page_video_complete_views_30s_paid" + // all 3
  ",page_video_complete_views_30s_organic" + // all 3
  ",page_video_complete_views_30s_autoplayed" + // all 3
  ",page_video_complete_views_30s_click_to_play" + // all 3
  ",page_video_complete_views_30s_unique" + // all 3
  ",page_video_complete_views_30s_repeat_views" + // all 3
  ",page_video_views_10s" + // all 3
  ",page_video_views_10s_paid" + // all 3
  ",page_video_views_10s_organic" + // all 3
  ",page_video_views_10s_autoplayed" + // all 3
  ",page_video_views_10s_click_to_play" + // all 3
  ",page_video_views_10s_unique" + // all 3
  ",page_video_views_10s_repeat" + // all 3
  ",page_video_view_time" + // day
  ",page_posts_impressions" + // all 3
  ",page_posts_impressions_unique" + // all 3
  ",page_posts_impressions_paid" + // all 3
  ",page_posts_impressions_paid_unique" + // all 3
  ",page_posts_impressions_organic" + // all 3
  ",page_posts_impressions_organic_unique" + // all 3
  ",page_posts_served_impressions_organic_unique" + // all 3
  ",page_posts_impressions_viral" + // all 3
  ",page_posts_impressions_viral_unique" + // all 3
  ",page_posts_impressions_nonviral" + // all 3
  ",page_posts_impressions_nonviral_unique" + // all 3
  ",page_posts_impressions_frequency_distribution" + // all 3
  "&date_preset=";

const fbPostRequest =
  "/insights?metric=" +
  ",post_activity" +
  ",post_activity_unique" +
  ",post_activity_by_action_type" +
  ",post_activity_by_action_type_unique" +
  ",post_video_complete_views_30s_autoplayed" +
  ",post_video_complete_views_30s_clicked_to_play" +
  ",post_video_complete_views_30s_organic" +
  ",post_video_complete_views_30s_paid" +
  ",post_video_complete_views_30s_unique" +
  ",post_impressions" +
  ",post_impressions_unique" +
  ",post_impressions_paid" +
  ",post_impressions_paid_unique" +
  ",post_impressions_fan" +
  ",post_impressions_fan_unique" +
  ",post_impressions_fan_paid" +
  ",post_impressions_fan_paid_unique" +
  ",post_impressions_organic" +
  ",post_impressions_organic_unique" +
  ",post_impressions_viral" +
  ",post_impressions_viral_unique" +
  ",post_impressions_nonviral" +
  ",post_impressions_nonviral_unique" +
  ",post_impressions_by_story_type" +
  ",post_impressions_by_story_type_unique" +
  ",post_engaged_users" +
  ",post_negative_feedback" +
  ",post_negative_feedback_unique" +
  ",post_negative_feedback_by_type" +
  ",post_negative_feedback_by_type_unique" +
  ",post_engaged_fan" +
  ",post_clicks" +
  ",post_clicks_unique" +
  ",post_clicks_by_type" +
  ",post_clicks_by_type_unique" +
  ",post_reactions_like_total" +
  ",post_reactions_love_total" +
  ",post_reactions_wow_total" +
  ",post_reactions_haha_total" +
  ",post_reactions_sorry_total" +
  ",post_reactions_anger_total" +
  ",post_reactions_by_type_total" +
  ",post_video_avg_time_watched" +
  ",post_video_complete_views_organic" +
  ",post_video_complete_views_organic_unique" +
  ",post_video_complete_views_paid" +
  ",post_video_complete_views_paid_unique" +
  ",post_video_retention_graph" +
  ",post_video_retention_graph_clicked_to_play" +
  ",post_video_retention_graph_autoplayed" +
  ",post_video_views_organic" +
  ",post_video_views_organic_unique" +
  ",post_video_views_paid" +
  ",post_video_views_paid_unique" +
  ",post_video_length" +
  ",post_video_views" +
  ",post_video_views_unique" +
  ",post_video_views_autoplayed" +
  ",post_video_views_clicked_to_play" +
  ",post_video_views_10s" +
  ",post_video_views_10s_unique" +
  ",post_video_views_10s_autoplayed" +
  ",post_video_views_10s_clicked_to_play" +
  ",post_video_views_10s_organic" +
  ",post_video_views_10s_paid" +
  ",post_video_views_10s_sound_on" +
  ",post_video_views_sound_on" +
  ",post_video_view_time" +
  ",post_video_view_time_organic" +
  ",post_video_view_time_by_age_bucket_and_gender" +
  ",post_video_view_time_by_region_id" +
  ",post_video_views_by_distribution_type" +
  ",post_video_view_time_by_distribution_type" +
  ",post_video_view_time_by_country_id" +
  "&period=lifetime";

const instagramAccountRequest =
  "/insights?metric=" +
  "impressions" +
  ",profile_views" +
  ",follower_count" +
  ",get_directions_clicks" +
  ",phone_call_clicks" +
  ",profile_views" +
  ",reach" +
  ",text_message_clicks" +
  ",website_clicks" +
  "&period=day";

module.exports = {
  fbAccountRequest,
  fbPostRequest,
  instagramAccountRequest
};

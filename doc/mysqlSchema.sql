#spider_url
create table if not exists spider_url (
    id varchar(64) not null,
    url varchar(192) primary key,
    source_url varchar(192) default null,
    init_url varchar(192) default null,
    spider_status int(11) default 0,
    image_count int(11) default 0,
    insert_time double not null
);

#image_url
create table if not exists image_url (
    id varchar(64) not null,
    image_url varchar(192) primary key,
    source_url varchar(192) default null,
    init_url varchar(192) default null,
    download_status int(11) default 0,
    download_error_status int(11) default 0,
    image_status int(11) default 1,
    insert_time double not null,
    image_byte int(11) default 0
);

#stock_day
CREATE TABLE if not exists `stock_day` (
  `code` varchar(16) NOT NULL COMMENT '股票的代码，上证股票以sh开头，深证股票以sz开头',
  `date` datetime DEFAULT NULL COMMENT '交易日期',
  `open` double DEFAULT NULL COMMENT '开盘价',
  `high` double DEFAULT NULL COMMENT '最高价',
  `low` double DEFAULT NULL COMMENT '最低价',
  `close` double DEFAULT NULL COMMENT '收盘价',
  `up_down` double DEFAULT NULL COMMENT '涨跌幅，复权之后的真实涨跌幅',
  `volume` double DEFAULT NULL COMMENT '成交量',
  `money` double DEFAULT NULL COMMENT '成交额',
  `traded_market_value` double DEFAULT NULL COMMENT '流通市值',
  `market_value` double DEFAULT NULL COMMENT '总市值',
  `turnover` double DEFAULT NULL COMMENT '换手率',
  `adjust_price` double DEFAULT NULL COMMENT '后复权价',
  `report_type` datetime DEFAULT NULL COMMENT '最近一期财务报告的类型，3-31对应一季报，6-30对应半年报，9-30对应三季报，12-31对应年报',
  `report_date` datetime DEFAULT NULL COMMENT '最近一期财务报告实际发布的日期',
  `PE_TIM` double DEFAULT NULL COMMENT '最近12个月市盈率，股价 / 最近12个月归属母公司的每股收益TTM',
  `PS_TIM` double DEFAULT NULL COMMENT '最近12个月市销率， 股价 / 最近12个月每股营业收入',
  `PC_TTM` double DEFAULT NULL COMMENT '最近12个月市现率， 股价 / 最近12个月每股经营现金流',
  `PB` double DEFAULT NULL COMMENT '市净率，股价 / 最近期财报每股净资产',
  `prefix` varchar(16) DEFAULT NULL,
  KEY `index_code` (`code`),
  KEY `index_code_short` (`prefix`)
);

#stock_follow_trend_profit
create table if not exists stock_follow_trend_profit (
    code varchar(16),
    min_begin_date datetime,
    max_end_date datetime,
    high_buy_interval int,
    low_sale_interval int,
    first_cost float,
    years float,
    profit float,
    max_lose float,
    annual_return float,
    primary key (code, min_begin_date, max_end_date, high_buy_interval, low_sale_interval)
);

#stock_follow_trend_statistic
create table if not exists stock_follow_trend_statistic (
    year_scope varchar(32),
    min_begin_date datetime,
    max_end_date datetime,
    high_buy_interval int,
    low_sale_interval int,
    code_counts int,
    avg_years float,
    avg_max_lose float,
    avg_first_cost float,
    avg_profit float,
    avg_annual_return float,
    primary key (year_scope, min_begin_date, max_end_date, high_buy_interval, low_sale_interval)
);

#stock_code_pool
create table if not exists stock_code_pool (
    code varchar(16) primary key,
    prefix varchar(8) COMMENT 'sh | sz',
    hold_state int default 0
);

#stock_following
create table if not exists stock_following (
    code varchar(16),
    date datetime,
    open float,
    close float,
    high float,
    low float,
    up_down float,
    volume float,
    before_rehabilitation_open float,
    before_rehabilitation_close float,
    primary key(code, date)
);

#stock_code_name
create table if not exists stock_code_name (
    code varchar(16) primary key,
    prefix varchar(8),
    name varchar(64)
);

#stock_user_favorite
create table if not exists stock_user_favorite (
    code varchar(16),
    user_id varchar(64),
    sort_no int,
    primary key(code, user_id);
);

#stock_user_position
create table if not exists stock_user_position (
    code varchar(16),
    user_id varchar(64),
    cost_price float,
    volume float,
    sort_no int,
    primary key(code, user_id)
)

#stock_user_trend_history
create table if not exists stock_user_trend_history (
    code varchar(16),
    user_id varchar(64),
    date datetime,
    price float,
    volume float,
    type varchar(16) comment 'buy|sale',
    profit float
);

#user
create table if not exists user (
    id varchar(64) primary key,
    username varchar(64),
    password varchar(64)
);

#oauth相关表
create table if not exists oauth_clients (
    client_id varchar(64),
    client_secret varchar(64),
    redirect_uri varchar(128) not null,
    primary key(client_id, client_secret)
);

create table if not exists oauth_access_tokens (
    access_token varchar(128) primary key,
    client_id varchar(64) not null,
    user_id varchar(64) not null,
    expires timestamp not null
);

create table if not exists oauth_refresh_tokens (
    refresh_token varchar(128) not null primary key,
    client_id varchar(64) not null,
    user_id varchar(64) not null,
    expires timestamp not null
);

create table if not exists oauth_codes (
    auth_code varchar(64) not null primary key,
    client_id varchar(64) not null,
    user_id varchar(64) not null,
    expires timestamp not null
);

#院校匹配相关表 sa:study_abroad
#留学计划
create table if not exists sa_plan (
    id varchar(64) primary key,
    hope_in_country varchar(64) comment '想去的国家',
    hope_in_year varchar(32) comment '计划出国时间',
    current_grade varchar(64) comment '目前就读年级',
    degree_course varchar(32) comment '想读学位',
    degree_title varchar(32) comment '想读学位的title',
    grade_in_school varchar(64) comment '最近就读学校',
    grade_in_major varchar(64) comment '最近就读专业',
    grade_gpa float comment '期中期末考试平均分',
    hope_in_major varchar(64) comment '希望就读专业',
    hope_in_major_sub varchar(64) comment '希望就读专业细分',
    language_key varchar(32) comment '语言成绩类别',
    language_value float comment '语言成绩分'
);

#推荐类别
create table if not exists sa_recommend_cate (
    id varchar(64) primary key,
    plan_id varchar(64) comment '计划id',
    name varchar(32) comment '类别名',
    school_count int comment '学校数'
);

#推荐学校列表
create table if not exists sa_recommend_school (
    id varchar(64) primary key,
    plan_id varchar(64) comment '计划id',
    cate_id varchar(64) comment '类别id',
    c_name varchar(128) comment '中文名',
    e_name varchar(128) comment '英文名字',
    degree_name varchar(64) comment '学位等级'
);
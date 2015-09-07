#webApp接口摘要

##stock

 * 根据买卖时间以及量计算收益(post): **/stock/calculateProfit/:stockCode**

 * 使用趋势追踪获取股票买卖点(post): **/stock/followTrendOperateInfo/:stockCode**
 
 * 使用趋势追踪获取股票买卖点并计算收益(get): **/stock/followTrend/:stockCode**
 
 * 添加股票到自选之中(get): **/stock/addStock2Pool/:stockCode**

 * 增加股票成交记录(get): **/stock/addTrendHistory/:stockCode**


##image
 * 获取随机图片的url(get): **/image/randomUrl**
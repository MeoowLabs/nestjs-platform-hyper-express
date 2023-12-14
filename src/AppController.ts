import { Body, Controller, Headers, HostParam, Ip, Param, Post, Query, Session } from '@nestjs/common';

@Controller()
export class AppController {
  @Post(':id')
  public status(@Body() body: any, @Param('id') id: string, @Headers() head: any, @Query() query: any, @Session() session: any, @Ip() ip: any, @HostParam() hostParam: any): string {
    console.log(body);
    console.log(id);
    console.log(head);
    console.log(query);
    console.log(session);
    console.log(ip);
    console.log(hostParam);
    return body;
  }
}

function MagnifierUI(magnifierObj) {

    let
        magnifierUIRef = this,
        events = {}
    ;

    function PushEvent(eventName, func) {
        events[eventName].push(func);
        return this;
    }

    function TriggerEvents(eventName, scope, params) {
        for (let i in events[eventName])
            if (events[eventName][i].apply(scope, params) === false)
                return false;
        return true;
    }

    this.uiCfg = {
        scrollContext: $('body'),
    }

    this.DisableScrollContext = function(){  
        this.uiCfg.scrollContext.css({
            overflow: 'hidden',
            padding: '0 0 0 8px',
        });
    }

    this.EnableScrollContext = function(){  
        this.uiCfg.scrollContext.css({
            padding: '',
            overflow: '',
        });
    }

    this.Init = function(uiCfg) {

        this.uiCfg = $.extend(true, this.uiCfg, uiCfg);

        for(let eventName in this.uiCfg.events)
            PushEvent(eventName, this.uiCfg.events[eventName]);

        magnifierObj.PushEvent('AfterInit',function(){
 
            let 
                magnifierRef = this,
                magnifiedImg,
                imgBox,
                zoom,
                zoomSpeed,
                imgBoxWidth,
                imgBoxHeight,
                magnifierBoxWidth,
                magnifierBoxHeight,
                magnifierBoxHalfWidth,
                magnifierBoxHalfHeight,
                magnifierBox,
                mainImg,
                imgBoxToMagnifierBoxHeightRatio, // حالت های دیگر بررسی شود
                currentMouseXPos = 0,
                currentMouseYPos = 0
            ;

            function SetMagnifiedImg(xPos,yPos){
                magnifiedImg.css({
                    top: function(){
                        if(
                            yPos > 0 &&
                            yPos <= magnifierBoxHalfHeight/zoom
                        )
                            return 0;
                        else if(
                            yPos > magnifierBoxHalfHeight/zoom &&
                            yPos <= imgBoxHeight - (magnifierBoxHalfHeight/zoom)
                        )
                            return -(zoom*yPos - magnifierBoxHalfHeight);
                        else if(
                            yPos > imgBoxHeight - (magnifierBoxHalfHeight/zoom) 
                        )
                            return -zoom*(imgBoxHeight - 2*(magnifierBoxHalfHeight/zoom));
                    }(),
                    left: function(){
                        if(
                            xPos > 0 && 
                            xPos <= magnifierBoxHalfWidth/zoom 
                        )
                            return 0;
                        else if(
                            xPos > magnifierBoxHalfWidth/zoom && 
                            xPos <= imgBoxWidth - (magnifierBoxHalfWidth/zoom) 
                        )
                            return -(zoom*xPos - magnifierBoxHalfWidth);
                        else if(
                            xPos > imgBoxWidth - (magnifierBoxHalfWidth/zoom) 
                        )
                            return -zoom*(imgBoxWidth - 2*(magnifierBoxHalfWidth/zoom));
                    }(),
                });
            }
            
            function SetMagnifierBoxPosition(xPos,yPos){
                magnifierBox.css({
                    top: function(){
                        if(
                            yPos > 0 &&
                            yPos <= magnifierBoxHalfHeight
                        )
                            return 0;
                        else if(
                            yPos > magnifierBoxHalfHeight &&
                            yPos <= (imgBoxHeight - magnifierBoxHalfHeight)
                        )
                            return yPos - magnifierBoxHalfHeight;
                        else if(
                            yPos > (imgBoxHeight - magnifierBoxHalfHeight)
                        )
                            return imgBoxHeight - magnifierBoxHeight;
                    }(),
                    left: function(){
                        if(
                            xPos > 0 && 
                            xPos <= magnifierBoxHalfWidth
                        )
                            return 0;
                        else if(
                            xPos > magnifierBoxHalfWidth && 
                            xPos <= (imgBoxWidth - magnifierBoxHalfWidth)
                        )
                            return xPos - magnifierBoxHalfWidth;
                        else if(
                            xPos > (imgBoxWidth - magnifierBoxHalfWidth) 
                        )
                            return imgBoxWidth - magnifierBoxWidth;
                    }(),
                });
            }

            this.SetMagnifierBox = function(ePageX,ePageY){

                let 
                    xPos = ePageX - imgBox.offset().left,
                    yPos = ePageY - imgBox.offset().top
                ;

                SetMagnifierBoxPosition(xPos,yPos);
                SetMagnifiedImg(xPos,yPos);
            }

            this.uiCfg = $.extend({
                imgBox: null,
                zoom: 1,
                zoomSpeed: 0.1,
                magnifierBox: $('<div class="magnifier-box">'),
                imgBoxWidth: 0,
                imgBoxHeight: 0,
                magnifierBoxWidth: 0,
                magnifierBoxHeight: 0,
            },this.cfg.uiCfg);

            (imgBox = this.uiCfg.imgBox).append(
                magnifierBox = this.uiCfg.magnifierBox
            );

            mainImg = 
                $('> img.main-img',imgBox)
                .css({
                    display: 'flex',
                })
            ;

            magnifierBox.append(
                magnifiedImg = 
                    $(`<img src="${mainImg.attr('src')}">`)
                        .css({
                            boxSizing: 'border-box',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                        })
            );

            zoom = this.uiCfg.zoom;
            zoomSpeed = this.uiCfg.zoomSpeed;
            imgBoxWidth = this.uiCfg.imgBoxWidth ? this.uiCfg.imgBoxWidth : imgBox.width();
            imgBoxHeight = this.uiCfg.imgBoxHeight ? this.uiCfg.imgBoxHeight : imgBox.height();
            magnifierBoxWidth = this.uiCfg.magnifierBoxWidth ? this.uiCfg.magnifierBoxWidth : imgBoxWidth / 2;
            magnifierBoxHeight = this.uiCfg.magnifierBoxHeight ? this.uiCfg.magnifierBoxHeight : imgBoxHeight / 2;
            magnifierBoxHalfWidth = magnifierBoxWidth / 2;
            magnifierBoxHalfHeight = magnifierBoxHeight / 2;
            imgBoxToMagnifierBoxHeightRatio = imgBoxHeight/magnifierBoxHeight;

            magnifiedImg.css({
                height: `${(zoom*100)*imgBoxToMagnifierBoxHeightRatio}%`,
                // scale: '200%',
            });

            imgBox.css({
                boxSizing: 'border-box',
                position: 'relative',
                width: imgBoxWidth,
                height: imgBoxHeight,
            });

            magnifierBox.css({
                // boxSizing: 'border-box',
                display: 'none',
                position: 'absolute',
                top: 0,
                left: 0,
                width: magnifierBoxWidth,
                height: magnifierBoxHeight,
                border: '1px solid grey',
                // boxShadow: '0px 0px 1px 1px grey',
                overflow: 'hidden',
            });

            imgBox
                .on('mouseenter',function(){
                    if(magnifierRef.isEnabled){
                        Magnifier.prototype.currentMagnifierId = magnifierRef.id;
                        magnifierUIRef.DisableScrollContext();
                        magnifierRef.Show();
                    }
                })
                .on('mouseleave',function(){
                    Magnifier.prototype.currentMagnifierId = null;
                    if(magnifierRef.isEnabled){
                        magnifierRef.Hide();
                        currentMouseXPos = 0;
                        currentMouseYPos = 0;
                        magnifierUIRef.EnableScrollContext();
                    }
                })
                .on('mousemove',function(e){

                    if(magnifierRef.isEnabled){
                        let 
                            imgBox = $(this),
                            xPos = e.pageX - imgBox.offset().left,
                            yPos = e.pageY - imgBox.offset().top
                        ;

                        // console.log(
                        //     e.pageX,
                        //     e.pageY,
                        //     imgBox.offset().left,
                        //     imgBox.offset().top,
                        //     xPos,
                        //     yPos
                        // );

                        if(
                            xPos <= 0 ||
                            xPos >= imgBoxWidth ||
                            yPos <= 0 ||
                            yPos >= imgBoxHeight 
                        ){
                            magnifierRef.Hide();
                            return; // آیا لازم است؟
                        }else{

                            SetMagnifierBoxPosition(xPos,yPos);
                            SetMagnifiedImg(xPos,yPos);

                            magnifierRef.Show();
                        }

                        currentMouseXPos = xPos;
                        currentMouseYPos = yPos;
                    }
                })
            ;

            $(window).on(`wheel.${magnifierRef.id}`, function(event){
 
                if(
                    Magnifier.prototype.currentMagnifierId === magnifierRef.id &&
                    magnifierRef.isEnabled
                ){
                    if(event.originalEvent.deltaY !== 0){

                        if(event.originalEvent.deltaY < 0) // wheeled up
                            magnifiedImg.css({
                                height: `${((zoom = +(zoom + zoomSpeed).toFixed(1))*100)*imgBoxToMagnifierBoxHeightRatio}%`,
                            });
                        else // wheeled down
                            magnifiedImg.css({
                                height: function(){
                                    if(zoom >= (1 + zoomSpeed))
                                        return `${((zoom = +(zoom - zoomSpeed).toFixed(1))*100)*imgBoxToMagnifierBoxHeightRatio}%`;
                                    else 
                                        return `${(zoom*100)*imgBoxToMagnifierBoxHeightRatio}%`;
                                }(),
                            });
                        SetMagnifiedImg(currentMouseXPos,currentMouseYPos);
                    }
                }
            });  
        });

        magnifierObj.PushEvent('BeforeDisable',function(){
            this.Hide();
        });

        magnifierObj.PushEvent('BeforeDestroy',function(){
            $(window).off(`wheel.${this.id}`);
        });

        magnifierObj.PushEvent('OnShow',function(){
            this.uiCfg.magnifierBox.css({
                display: 'block',
            });
        });

        magnifierObj.PushEvent('OnHide',function(){
            this.uiCfg.magnifierBox.css({
                display: 'none',
            });
        });
    }   
}

Magnifier.prototype.uiConstructorFunc = MagnifierUI;
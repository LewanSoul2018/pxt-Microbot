sendBufferAsm:

    push {r4,r5,r6,r7,lr}
    
    mov r4, r0 ; save buff
    mov r6, r1 ; save pin
    
    mov r0, r4
    bl BufferMethods::length
    mov r5, r0
    
    mov r0, r4
    bl BufferMethods::getBytes
    mov r4, r0
    
    ; setup pin as digital
    mov r0, r6
    movs r1, #0
    bl pins::digitalWritePin
    
    ; load pin address
    mov r0, r6
    bl pins::getPinAddress

    ldr r0, [r0, #8] ; get mbed DigitalOut from MicroBitPin
    ldr r1, [r0, #4] ; r1-mask for this pin
    ldr r2, [r0, #16] ; r2-clraddr
    ldr r3, [r0, #12] ; r3-setaddr
    
    cpsid i ; disable irq
    
    b .start
    
.nextbit:               ;            C0
    str r1, [r3, #0]    ; pin := hi  C2
    tst r6, r0          ;            C3
    bne .islate         ;            C4
    str r1, [r2, #0]    ; pin := lo  C6
.islate:
    lsrs r6, r6, #1     ; r6 >>= 1   C7
    bne .justbit        ;            C8
    
    ; not just a bit - need new byte
    adds r4, #1         ; r4++       C9
    subs r5, #1         ; r5--       C10
    bcc .stop           ; if (r5<0) goto .stop  C11
.start:
    movs r6, #0x80      ; reset mask C12
    nop                 ;            C13

.common:               ;             C13
    str r1, [r2, #0]   ; pin := lo   C15
    ; always re-load byte - it just fits with the cycles better this way
    ldrb r0, [r4, #0]  ; r0 := *r4   C17
    b .nextbit         ;             C20

.justbit: ; C10
    ; no nops, branch taken is already 3 cycles
    b .common ; C13

.stop:    
    str r1, [r2, #0]   ; pin := lo
    cpsie i            ; enable irq

    pop {r4,r5,r6,r7,pc}


